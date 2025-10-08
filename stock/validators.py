"""
Validators - Validación de datos de negocio
Implementa el patrón Chain of Responsibility para validaciones
"""

from decimal import Decimal
from django.core.exceptions import ValidationError
from typing import Any


class BaseValidator:
    """Clase base para validadores con patrón Chain of Responsibility"""
    
    def __init__(self):
        self.next_validator = None
    
    def set_next(self, validator):
        """Establece el siguiente validador en la cadena"""
        self.next_validator = validator
        return validator
    
    def validate(self, value: Any) -> None:
        """Ejecuta la validación y pasa al siguiente si existe"""
        self._validate(value)
        if self.next_validator:
            self.next_validator.validate(value)
    
    def _validate(self, value: Any) -> None:
        """Método a implementar por subclases"""
        raise NotImplementedError


class PositiveNumberValidator(BaseValidator):
    """Valida que un número sea positivo"""
    
    def _validate(self, value: Any) -> None:
        if not isinstance(value, (int, float, Decimal)):
            raise ValidationError("El valor debe ser un número")
        if value <= 0:
            raise ValidationError("El valor debe ser mayor que cero")


class MinimumValueValidator(BaseValidator):
    """Valida que un valor sea mayor o igual a un mínimo"""
    
    def __init__(self, min_value: Any):
        super().__init__()
        self.min_value = min_value
    
    def _validate(self, value: Any) -> None:
        if value < self.min_value:
            raise ValidationError(
                f"El valor debe ser mayor o igual a {self.min_value}"
            )


class MaximumValueValidator(BaseValidator):
    """Valida que un valor sea menor o igual a un máximo"""
    
    def __init__(self, max_value: Any):
        super().__init__()
        self.max_value = max_value
    
    def _validate(self, value: Any) -> None:
        if value > self.max_value:
            raise ValidationError(
                f"El valor debe ser menor o igual a {self.max_value}"
            )


class StockValidator:
    """
    Validador específico para operaciones de stock.
    Agrupa validaciones comunes de inventario.
    """
    
    def validar_cantidad_positiva(self, cantidad: int) -> None:
        """
        Valida que la cantidad sea un entero positivo.
        
        Args:
            cantidad: Cantidad a validar
            
        Raises:
            ValidationError: Si la cantidad no es válida
        """
        if not isinstance(cantidad, int):
            raise ValidationError("La cantidad debe ser un número entero")
        
        if cantidad <= 0:
            raise ValidationError("La cantidad debe ser mayor que cero")
    
    def validar_precio(self, precio: Decimal) -> None:
        """
        Valida que el precio sea válido.
        
        Args:
            precio: Precio a validar
            
        Raises:
            ValidationError: Si el precio no es válido
        """
        if not isinstance(precio, (Decimal, float, int)):
            raise ValidationError("El precio debe ser un número")
        
        precio = Decimal(str(precio))
        
        if precio <= 0:
            raise ValidationError("El precio debe ser mayor que cero")
        
        if precio > Decimal('9999999.99'):
            raise ValidationError(
                "El precio excede el máximo permitido (9999999.99)"
            )
    
    def validar_stock_suficiente(
        self, 
        disponible: int, 
        requerido: int
    ) -> None:
        """
        Valida que haya stock suficiente.
        
        Args:
            disponible: Stock disponible
            requerido: Stock requerido
            
        Raises:
            ValidationError: Si no hay stock suficiente
        """
        if disponible < requerido:
            raise ValidationError(
                f"Stock insuficiente. Disponible: {disponible}, "
                f"Requerido: {requerido}"
            )


class MovimientoValidator:
    """
    Validador específico para movimientos de inventario.
    """
    
    TIPOS_VALIDOS = ['entrada', 'salida']
    
    def validar_tipo_movimiento(self, tipo: str) -> None:
        """
        Valida que el tipo de movimiento sea válido.
        
        Args:
            tipo: Tipo de movimiento
            
        Raises:
            ValidationError: Si el tipo no es válido
        """
        if tipo not in self.TIPOS_VALIDOS:
            raise ValidationError(
                f"Tipo de movimiento inválido. "
                f"Valores permitidos: {', '.join(self.TIPOS_VALIDOS)}"
            )
    
    def validar_cantidad_positiva(self, cantidad: int) -> None:
        """
        Valida que la cantidad sea positiva.
        
        Args:
            cantidad: Cantidad a validar
            
        Raises:
            ValidationError: Si la cantidad no es válida
        """
        if not isinstance(cantidad, int):
            raise ValidationError("La cantidad debe ser un número entero")
        
        if cantidad <= 0:
            raise ValidationError("La cantidad debe ser mayor que cero")


class AdministradorValidator:
    """
    Validador específico para administradores.
    """
    
    def validar_username(self, username: str) -> None:
        """
        Valida que el username sea válido.
        
        Args:
            username: Username a validar
            
        Raises:
            ValidationError: Si el username no es válido
        """
        if not username:
            raise ValidationError("El username es requerido")
        
        if len(username) < 3:
            raise ValidationError(
                "El username debe tener al menos 3 caracteres"
            )
        
        if len(username) > 50:
            raise ValidationError(
                "El username no puede tener más de 50 caracteres"
            )
        
        if not username.isalnum():
            raise ValidationError(
                "El username solo puede contener letras y números"
            )
    
    def validar_password(self, password: str) -> None:
        """
        Valida que la contraseña cumpla con los requisitos mínimos.
        
        Args:
            password: Contraseña a validar
            
        Raises:
            ValidationError: Si la contraseña no es válida
        """
        if not password:
            raise ValidationError("La contraseña es requerida")
        
        if len(password) < 8:
            raise ValidationError(
                "La contraseña debe tener al menos 8 caracteres"
            )
        
        if password.isdigit():
            raise ValidationError(
                "La contraseña no puede ser completamente numérica"
            )
        
        if password.islower() or password.isupper():
            raise ValidationError(
                "La contraseña debe contener mayúsculas y minúsculas"
            )


# ==============================================================================
# FACTORY PATTERN PARA VALIDADORES
# ==============================================================================

class ValidatorFactory:
    """
    Factory para crear validadores.
    Implementa el patrón Factory para centralizar la creación de validadores.
    """
    
    _validators = {
        'stock': StockValidator,
        'movimiento': MovimientoValidator,
        'administrador': AdministradorValidator,
    }
    
    @classmethod
    def create(cls, validator_type: str):
        """
        Crea un validador del tipo especificado.
        
        Args:
            validator_type: Tipo de validador a crear
            
        Returns:
            Instancia del validador
            
        Raises:
            ValueError: Si el tipo de validador no existe
        """
        validator_class = cls._validators.get(validator_type.lower())
        
        if not validator_class:
            raise ValueError(
                f"Tipo de validador '{validator_type}' no existe. "
                f"Tipos disponibles: {', '.join(cls._validators.keys())}"
            )
        
        return validator_class()
    
    @classmethod
    def register_validator(cls, name: str, validator_class):
        """
        Registra un nuevo tipo de validador.
        
        Args:
            name: Nombre del validador
            validator_class: Clase del validador
        """
        cls._validators[name.lower()] = validator_class