"""
Services Layer - Lógica de negocio separada de las vistas
Implementa el patrón Service Layer para mantener la lógica de negocio
separada de la capa de presentación (views)
"""

from typing import Protocol, Optional, Dict, Any
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
import logging

from .models import StockItem, Movimiento, Administrador
from .validators import StockValidator, MovimientoValidator

logger = logging.getLogger(__name__)


# ==============================================================================
# PROTOCOLS - Define contratos de interfaces
# ==============================================================================

class StockServiceProtocol(Protocol):
    """Protocol que define el contrato para servicios de stock"""
    
    def restar_stock(self, item_id: int, cantidad: int) -> Dict[str, Any]:
        """Resta cantidad del stock de un producto"""
        ...
    
    def agregar_stock(self, item_id: int, cantidad: int) -> Dict[str, Any]:
        """Agrega cantidad al stock de un producto"""
        ...


# ==============================================================================
# EXCEPCIONES PERSONALIZADAS
# ==============================================================================

class StockInsuficienteError(Exception):
    """Excepción lanzada cuando no hay suficiente stock"""
    pass


class ProductoNoEncontradoError(Exception):
    """Excepción lanzada cuando no se encuentra un producto"""
    pass


# ==============================================================================
# SERVICIOS
# ==============================================================================

class StockService:
    """
    Servicio para manejar operaciones de stock.
    Implementa la lógica de negocio para operaciones de inventario.
    """
    
    def __init__(self):
        self.validator = StockValidator()
    
    @transaction.atomic
    def restar_stock(
        self, 
        item_id: int, 
        cantidad: int,
        crear_movimiento: bool = True
    ) -> Dict[str, Any]:
        """
        Resta stock de un producto y opcionalmente crea un movimiento.
        
        Args:
            item_id: ID del producto
            cantidad: Cantidad a restar
            crear_movimiento: Si debe crear un registro de movimiento
            
        Returns:
            Dict con mensaje y nuevo stock
            
        Raises:
            ProductoNoEncontradoError: Si el producto no existe
            StockInsuficienteError: Si no hay suficiente stock
            ValidationError: Si los datos son inválidos
        """
        try:
            item = StockItem.objects.select_for_update().get(pk=item_id)
        except StockItem.DoesNotExist:
            logger.error(f"Producto con ID {item_id} no encontrado")
            raise ProductoNoEncontradoError(f"Producto con ID {item_id} no existe")
        
        # Validar cantidad
        self.validator.validar_cantidad_positiva(cantidad)
        
        # Validar stock suficiente
        if item.cantidad < cantidad:
            logger.warning(
                f"Stock insuficiente para producto {item.nombre}. "
                f"Disponible: {item.cantidad}, Solicitado: {cantidad}"
            )
            raise StockInsuficienteError(
                f"Stock insuficiente. Disponible: {item.cantidad}, Solicitado: {cantidad}"
            )
        
        # Restar stock
        item.cantidad -= cantidad
        item.save()
        
        logger.info(
            f"Stock reducido para {item.nombre}. "
            f"Cantidad restada: {cantidad}, Nuevo stock: {item.cantidad}"
        )
        
        # Crear movimiento si se solicita
        if crear_movimiento:
            MovimientoService().crear_movimiento(
                producto=item,
                tipo='salida',
                cantidad=cantidad
            )
        
        return {
            'mensaje': 'Stock reducido exitosamente',
            'producto': item.nombre,
            'cantidad_restada': cantidad,
            'nuevo_stock': item.cantidad
        }
    
    @transaction.atomic
    def agregar_stock(
        self,
        item_id: int,
        cantidad: int,
        crear_movimiento: bool = True
    ) -> Dict[str, Any]:
        """
        Agrega stock a un producto y opcionalmente crea un movimiento.
        
        Args:
            item_id: ID del producto
            cantidad: Cantidad a agregar
            crear_movimiento: Si debe crear un registro de movimiento
            
        Returns:
            Dict con mensaje y nuevo stock
            
        Raises:
            ProductoNoEncontradoError: Si el producto no existe
            ValidationError: Si los datos son inválidos
        """
        try:
            item = StockItem.objects.select_for_update().get(pk=item_id)
        except StockItem.DoesNotExist:
            logger.error(f"Producto con ID {item_id} no encontrado")
            raise ProductoNoEncontradoError(f"Producto con ID {item_id} no existe")
        
        # Validar cantidad
        self.validator.validar_cantidad_positiva(cantidad)
        
        # Agregar stock
        item.cantidad += cantidad
        item.save()
        
        logger.info(
            f"Stock agregado para {item.nombre}. "
            f"Cantidad agregada: {cantidad}, Nuevo stock: {item.cantidad}"
        )
        
        # Crear movimiento si se solicita
        if crear_movimiento:
            MovimientoService().crear_movimiento(
                producto=item,
                tipo='entrada',
                cantidad=cantidad
            )
        
        return {
            'mensaje': 'Stock actualizado exitosamente',
            'producto': item.nombre,
            'cantidad_agregada': cantidad,
            'nuevo_stock': item.cantidad
        }
    
    def obtener_productos_bajo_stock(self, umbral: int = 10) -> list:
        """
        Obtiene productos con stock por debajo del umbral especificado.
        
        Args:
            umbral: Cantidad mínima de stock
            
        Returns:
            Lista de productos con bajo stock
        """
        return StockItem.objects.filter(cantidad__lt=umbral).order_by('cantidad')
    
    def crear_producto(self, data: Dict[str, Any]) -> StockItem:
        """
        Crea un nuevo producto validando los datos.
        
        Args:
            data: Diccionario con datos del producto
            
        Returns:
            Instancia del producto creado
            
        Raises:
            ValidationError: Si los datos son inválidos
        """
        self.validator.validar_precio(data.get('precio'))
        self.validator.validar_cantidad_positiva(data.get('cantidad', 0))
        
        producto = StockItem.objects.create(**data)
        logger.info(f"Producto creado: {producto.nombre}")
        
        return producto


class MovimientoService:
    """
    Servicio para manejar operaciones de movimientos de inventario.
    """
    
    def __init__(self):
        self.validator = MovimientoValidator()
    
    def crear_movimiento(
        self,
        producto: StockItem,
        tipo: str,
        cantidad: int
    ) -> Movimiento:
        """
        Crea un nuevo movimiento de inventario.
        
        Args:
            producto: Instancia del producto
            tipo: Tipo de movimiento ('entrada' o 'salida')
            cantidad: Cantidad del movimiento
            
        Returns:
            Instancia del movimiento creado
            
        Raises:
            ValidationError: Si los datos son inválidos
        """
        self.validator.validar_tipo_movimiento(tipo)
        self.validator.validar_cantidad_positiva(cantidad)
        
        movimiento = Movimiento.objects.create(
            producto=producto,
            tipo=tipo,
            cantidad=cantidad
        )
        
        logger.info(
            f"Movimiento creado: {tipo} - {producto.nombre} - "
            f"Cantidad: {cantidad}"
        )
        
        return movimiento
    
    def obtener_movimientos_por_producto(
        self,
        producto_id: int,
        tipo: Optional[str] = None
    ) -> list:
        """
        Obtiene movimientos de un producto específico.
        
        Args:
            producto_id: ID del producto
            tipo: Tipo de movimiento a filtrar (opcional)
            
        Returns:
            Lista de movimientos
        """
        queryset = Movimiento.objects.filter(producto_id=producto_id)
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset.order_by('-fecha', '-hora')
    
    def obtener_resumen_movimientos(
        self,
        producto_id: int
    ) -> Dict[str, Any]:
        """
        Obtiene un resumen de movimientos de un producto.
        
        Args:
            producto_id: ID del producto
            
        Returns:
            Dict con resumen de entradas, salidas y total
        """
        entradas = Movimiento.objects.filter(
            producto_id=producto_id,
            tipo='entrada'
        ).aggregate(total=models.Sum('cantidad'))['total'] or 0
        
        salidas = Movimiento.objects.filter(
            producto_id=producto_id,
            tipo='salida'
        ).aggregate(total=models.Sum('cantidad'))['total'] or 0
        
        return {
            'producto_id': producto_id,
            'total_entradas': entradas,
            'total_salidas': salidas,
            'diferencia': entradas - salidas
        }


class AdministradorService:
    """
    Servicio para manejar operaciones de administradores.
    """
    
    def crear_administrador(
        self,
        username: str,
        password: str,
        is_staff: bool = False,
        is_superuser: bool = False
    ) -> Administrador:
        """
        Crea un nuevo administrador.
        
        Args:
            username: Nombre de usuario
            password: Contraseña
            is_staff: Si es staff
            is_superuser: Si es superusuario
            
        Returns:
            Instancia del administrador creado
            
        Raises:
            ValidationError: Si los datos son inválidos
        """
        if not username or not password:
            raise ValidationError("Username y password son requeridos")
        
        if is_superuser:
            admin = Administrador.objects.create_superuser(
                username=username,
                password=password
            )
        else:
            admin = Administrador.objects.create_user(
                username=username,
                password=password
            )
            admin.is_staff = is_staff
            admin.save()
        
        logger.info(f"Administrador creado: {username}")
        return admin