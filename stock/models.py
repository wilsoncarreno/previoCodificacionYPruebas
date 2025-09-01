from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

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
    
    

    objects = AdminUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username


# Modelo Productos
class StockItem(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.IntegerField(default=0)

    def __str__(self):
        return self.nombre
    
# Modelo Movimientos de Stock
class Movimiento(models.Model):
    Tipo_Choices = (
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    )
    producto = models.ForeignKey(StockItem, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=10, choices = Tipo_Choices)
    cantidad = models.IntegerField()
    fecha = models.DateTimeField(auto_now_add=True)
    hora = models.TimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo.capitalize()} - {self.producto.nombre} ({self.cantidad})"