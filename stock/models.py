from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.forms import ValidationError
from abc import ABC, abstractmethod
from typing import Protocol
import logging

class StockValidatorProtocol(Protocol):
    
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        ...

class MovementProcessorProtocol(Protocol):
    
    def process(self, movement: 'Movimiento') -> bool:
        ...

class BaseStockValidator(ABC):
    
    
    @abstractmethod
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        pass

class PositiveStockValidator(BaseStockValidator):
    
    
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        return item.cantidad + cantidad >= 0

class MinimumStockValidator(BaseStockValidator):
    
    
    def __init__(self, minimum: int = 0):
        self.minimum = minimum
    
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        return item.cantidad + cantidad >= self.minimum

class MaximumStockValidator(BaseStockValidator):
    
    
    def __init__(self, maximum: int = 9999):
        self.maximum = maximum
    
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        return item.cantidad + cantidad <= self.maximum

class BaseMovementProcessor(ABC):
    
    
    def __init__(self):
        self._next_processor = None
        self.logger = logging.getLogger(__name__)
    
    def set_next(self, processor: 'BaseMovementProcessor'):
        self._next_processor = processor
        return processor
    
    @abstractmethod
    def can_handle(self, movement: 'Movimiento') -> bool:
        pass
    
    @abstractmethod
    def handle(self, movement: 'Movimiento') -> bool:
        pass
    
    def process(self, movement: 'Movimiento') -> bool:
        if self.can_handle(movement):
            return self.handle(movement)
        elif self._next_processor:
            return self._next_processor.process(movement)
        return False

class EntradaProcessor(BaseMovementProcessor):
    
    
    def can_handle(self, movement: 'Movimiento') -> bool:
        return movement.tipo == 'entrada'
    
    def handle(self, movement: 'Movimiento') -> bool:
        try:
            movement.producto.cantidad += movement.cantidad
            movement.producto.save()
            self.logger.info(f"Entrada procesada: {movement}")
            return True
        except Exception as e:
            self.logger.error(f"Error procesando entrada: {e}")
            return False

class SalidaProcessor(BaseMovementProcessor):
    
    
    def can_handle(self, movement: 'Movimiento') -> bool:
        return movement.tipo == 'salida'
    
    def handle(self, movement: 'Movimiento') -> bool:
        if movement.producto.cantidad < movement.cantidad:
            self.logger.warning(f"Stock insuficiente para salida: {movement}")
            return False
        
        try:
            movement.producto.cantidad -= movement.cantidad
            movement.producto.save()
            self.logger.info(f"Salida procesada: {movement}")
            return True
        except Exception as e:
            self.logger.error(f"Error procesando salida: {e}")
            return False
class StockValidatorFactory:
        
    @staticmethod
    def create_validator(validator_type: str, **kwargs) -> BaseStockValidator:
        validators = {
            'positive': PositiveStockValidator,
            'minimum': lambda: MinimumStockValidator(kwargs.get('minimum', 0)),
            'maximum': lambda: MaximumStockValidator(kwargs.get('maximum', 9999))
        }
        
        if validator_type not in validators:
            raise ValueError(f"Tipo de validador no válido: {validator_type}")
        
        validator_class = validators[validator_type]
        return validator_class() if callable(validator_class) else validator_class

class StockService:
    
    
    def __init__(self):
        self.validators = [
            StockValidatorFactory.create_validator('positive'),
            StockValidatorFactory.create_validator('minimum', minimum=0)
        ]
        
        
        self.entrada_processor = EntradaProcessor()
        self.salida_processor = SalidaProcessor()
        self.entrada_processor.set_next(self.salida_processor)
        
        self.logger = logging.getLogger(__name__)
    
    def add_validator(self, validator: BaseStockValidator):
        
        self.validators.append(validator)
    
    def validate_movement(self, item: 'StockItem', tipo: str, cantidad: int) -> bool:
        
        cantidad_cambio = cantidad if tipo == 'entrada' else -cantidad
        
        for validator in self.validators:
            if not validator.validate(item, cantidad_cambio):
                return False
        return True
    
    def process_movement(self, movement: 'Movimiento') -> bool:
        
        if not self.validate_movement(
            movement.producto, 
            movement.tipo, 
            movement.cantidad
        ):
            self.logger.warning(f"Movimiento inválido: {movement}")
            return False
        
        return self.entrada_processor.process(movement)

class AdminUserManager(BaseUserManager):
    
    def _create_user(self, username: str, password: str = None, **extra_fields):
        
        if not username:
            raise ValueError('El usuario debe tener un nombre de usuario')
        
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_user(self, username: str, password: str = None, **extra_fields):
        
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_active', True)
        return self._create_user(username, password, **extra_fields)
    
    def create_superuser(self, username: str, password: str, **extra_fields):
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        
        return self._create_user(username, password, **extra_fields)

class Administrador(AbstractBaseUser, PermissionsMixin):
    
    username = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)     
    
    objects = AdminUserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    class Meta:
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'
    
    def __str__(self):
        return self.username
    
    def clean(self):
        
        super().clean()
        if self.username and len(self.username) < 3:
            raise ValidationError('El nombre de usuario debe tener al menos 3 caracteres')
        
class StockItem(models.Model):
    
    
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    stock_maximo = models.IntegerField(default=9999)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre
    
    def clean(self):
        
        super().clean()
        if self.precio < 0:
            raise ValidationError('El precio no puede ser negativo')
        if self.cantidad < 0:
            raise ValidationError('La cantidad no puede ser negativa')
        if self.stock_minimo < 0:
            raise ValidationError('El stock mínimo no puede ser negativo')
        if self.stock_maximo <= self.stock_minimo:
            raise ValidationError('El stock máximo debe ser mayor al mínimo')
    
    def tiene_stock_bajo(self) -> bool:
        
        return self.cantidad <= self.stock_minimo
    
    def puede_retirar(self, cantidad: int) -> bool:
        
        return self.cantidad >= cantidad
    
    def valor_total_stock(self) -> Decimal:
        
        return Decimal(str(self.cantidad)) * self.precio
    
class Movimiento(models.Model):
    
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]
    
    producto = models.ForeignKey(
        StockItem, 
        on_delete=models.CASCADE, 
        related_name='movimientos'
    )
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    cantidad = models.IntegerField()
    observaciones = models.TextField(blank=True)
    procesado = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        Administrador, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    
    _stock_service = None
    
    class Meta:
        verbose_name = 'Movimiento'
        verbose_name_plural = 'Movimientos'
        ordering = ['-fecha']
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.producto.nombre} ({self.cantidad})"
    
    @property
    def stock_service(self):
        
        if not self._stock_service:
            self._stock_service = StockService()
        return self._stock_service
    
    def clean(self):
        
        super().clean()
        if self.cantidad <= 0:
            raise ValidationError('La cantidad debe ser mayor a cero')
        
        if self.producto and not self.stock_service.validate_movement(
            self.producto, self.tipo, self.cantidad
        ):
            if self.tipo == 'salida':
                raise ValidationError('Stock insuficiente para la salida')
            else:
                raise ValidationError('Movimiento inválido')
    
    def save(self, *args, **kwargs):
        
        is_new = self.pk is None
        
        if is_new:
            self.full_clean()
        
        super().save(*args, **kwargs)
        
        if is_new and not self.procesado:
            if self.stock_service.process_movement(self):
                self.procesado = True
                super().save(update_fields=['procesado'])