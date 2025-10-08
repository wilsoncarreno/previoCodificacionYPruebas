"""
Test Suite - Pruebas unitarias y de integración
Cobertura completa de funcionalidad del sistema de inventario
"""

from decimal import Decimal
from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse

from .models import StockItem, Movimiento, Administrador
from .services import (
    StockService, 
    MovimientoService, 
    AdministradorService,
    StockInsuficienteError,
    ProductoNoEncontradoError
)
from .validators import StockValidator, MovimientoValidator, AdministradorValidator


# ==============================================================================
# TESTS DE MODELOS
# ==============================================================================

class StockItemModelTest(TestCase):
    """Pruebas para el modelo StockItem"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.producto = StockItem.objects.create(
            nombre="Producto Test",
            descripcion="Descripción del producto test",
            precio=Decimal("100.50"),
            cantidad=50
        )
    
    def test_crear_producto(self):
        """Test: Creación de producto exitosa"""
        self.assertEqual(self.producto.nombre, "Producto Test")
        self.assertEqual(self.producto.precio, Decimal("100.50"))
        self.assertEqual(self.producto.cantidad, 50)
    
    def test_str_producto(self):
        """Test: Representación en string del producto"""
        self.assertEqual(str(self.producto), "Producto Test")
    
    def test_precio_decimal(self):
        """Test: El precio se almacena correctamente como Decimal"""
        self.assertIsInstance(self.producto.precio, Decimal)


class MovimientoModelTest(TestCase):
    """Pruebas para el modelo Movimiento"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.producto = StockItem.objects.create(
            nombre="Producto Test",
            precio=Decimal("100.00"),
            cantidad=100
        )
        self.movimiento = Movimiento.objects.create(
            producto=self.producto,
            tipo='entrada',
            cantidad=20
        )
    
    def test_crear_movimiento(self):
        """Test: Creación de movimiento exitosa"""
        self.assertEqual(self.movimiento.producto, self.producto)
        self.assertEqual(self.movimiento.tipo, 'entrada')
        self.assertEqual(self.movimiento.cantidad, 20)
    
    def test_str_movimiento(self):
        """Test: Representación en string del movimiento"""
        expected = f"Entrada - {self.producto.nombre} (20)"
        self.assertEqual(str(self.movimiento), expected)
    
    def test_fecha_auto_creada(self):
        """Test: La fecha se crea automáticamente"""
        self.assertIsNotNone(self.movimiento.fecha)
        self.assertIsNotNone(self.movimiento.hora)


class AdministradorModelTest(TestCase):
    """Pruebas para el modelo Administrador"""
    
    def test_crear_usuario(self):
        """Test: Creación de usuario normal"""
        user = Administrador.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_crear_superusuario(self):
        """Test: Creación de superusuario"""
        admin = Administrador.objects.create_superuser(
            username='admin',
            password='adminpass123'
        )
        self.assertEqual(admin.username, 'admin')
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)


# ==============================================================================
# TESTS DE VALIDADORES
# ==============================================================================

class StockValidatorTest(TestCase):
    """Pruebas para StockValidator"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.validator = StockValidator()
    
    def test_validar_cantidad_positiva_valida(self):
        """Test: Validación exitosa de cantidad positiva"""
        try:
            self.validator.validar_cantidad_positiva(10)
        except ValidationError:
            self.fail("No debería lanzar ValidationError")
    
    def test_validar_cantidad_negativa(self):
        """Test: Rechaza cantidad negativa"""
        with self.assertRaises(ValidationError):
            self.validator.validar_cantidad_positiva(-5)
    
    def test_validar_cantidad_cero(self):
        """Test: Rechaza cantidad cero"""
        with self.assertRaises(ValidationError):
            self.validator.validar_cantidad_positiva(0)
    
    def test_validar_cantidad_no_entero(self):
        """Test: Rechaza cantidad no entera"""
        with self.assertRaises(ValidationError):
            self.validator.validar_cantidad_positiva(10.5)
    
    def test_validar_precio_valido(self):
        """Test: Validación exitosa de precio"""
        try:
            self.validator.validar_precio(Decimal("100.50"))
        except ValidationError:
            self.fail("No debería lanzar ValidationError")
    
    def test_validar_precio_negativo(self):
        """Test: Rechaza precio negativo"""
        with self.assertRaises(ValidationError):
            self.validator.validar_precio(Decimal("-10.00"))
    
    def test_validar_precio_muy_alto(self):
        """Test: Rechaza precio excesivo"""
        with self.assertRaises(ValidationError):
            self.validator.validar_precio(Decimal("99999999.99"))
    
    def test_validar_stock_suficiente(self):
        """Test: Validación exitosa de stock suficiente"""
        try:
            self.validator.validar_stock_suficiente(100, 50)
        except ValidationError:
            self.fail("No debería lanzar ValidationError")
    
    def test_validar_stock_insuficiente(self):
        """Test: Rechaza stock insuficiente"""
        with self.assertRaises(ValidationError):
            self.validator.validar_stock_suficiente(30, 50)


class MovimientoValidatorTest(TestCase):
    """Pruebas para MovimientoValidator"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.validator = MovimientoValidator()
    
    def test_validar_tipo_entrada(self):
        """Test: Acepta tipo 'entrada'"""
        try:
            self.validator.validar_tipo_movimiento('entrada')
        except ValidationError:
            self.fail("No debería lanzar ValidationError")
    
    def test_validar_tipo_salida(self):
        """Test: Acepta tipo 'salida'"""
        try:
            self.validator.validar_tipo_movimiento('salida')
        except ValidationError:
            self.fail("No debería lanzar ValidationError")
    
    def test_validar_tipo_invalido(self):
        """Test: Rechaza tipo inválido"""
        with self.assertRaises(ValidationError):
            self.validator.validar_tipo_movimiento('invalido')


# ==============================================================================
# TESTS DE SERVICIOS
# ==============================================================================

class StockServiceTest(TestCase):
    """Pruebas para StockService"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.service = StockService()
        self.producto = StockItem.objects.create(
            nombre="Producto Test",
            precio=Decimal("100.00"),
            cantidad=100
        )
    
    def test_restar_stock_exitoso(self):
        """Test: Resta de stock exitosa"""
        resultado = self.service.restar_stock(self.producto.id, 30)
        
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.cantidad, 70)
        self.assertEqual(resultado['nuevo_stock'], 70)
    
    def test_restar_stock_insuficiente(self):
        """Test: Falla al restar más stock del disponible"""
        with self.assertRaises(StockInsuficienteError):
            self.service.restar_stock(self.producto.id, 150)
    
    def test_restar_stock_producto_no_existe(self):
        """Test: Falla al restar stock de producto inexistente"""
        with self.assertRaises(ProductoNoEncontradoError):
            self.service.restar_stock(99999, 10)
    
    def test_agregar_stock_exitoso(self):
        """Test: Adición de stock exitosa"""
        resultado = self.service.agregar_stock(self.producto.id, 50)
        
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.cantidad, 150)
        self.assertEqual(resultado['nuevo_stock'], 150)
    
    def test_agregar_stock_crea_movimiento(self):
        """Test: Agregar stock crea movimiento automáticamente"""
        movimientos_antes = Movimiento.objects.count()
        self.service.agregar_stock(self.producto.id, 25)
        movimientos_despues = Movimiento.objects.count()
        
        self.assertEqual(movimientos_despues, movimientos_antes + 1)
    
    def test_obtener_productos_bajo_stock(self):
        """Test: Obtiene productos con bajo stock"""
        StockItem.objects.create(
            nombre="Producto Bajo Stock",
            precio=Decimal("50.00"),
            cantidad=5
        )
        
        productos = self.service.obtener_productos_bajo_stock(umbral=10)
        self.assertEqual(len(productos), 1)


class MovimientoServiceTest(TestCase):
    """Pruebas para MovimientoService"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.service = MovimientoService()
        self.producto = StockItem.objects.create(
            nombre="Producto Test",
            precio=Decimal("100.00"),
            cantidad=100
        )
    
    def test_crear_movimiento_entrada(self):
        """Test: Creación de movimiento de entrada"""
        movimiento = self.service.crear_movimiento(
            producto=self.producto,
            tipo='entrada',
            cantidad=20
        )
        
        self.assertEqual(movimiento.producto, self.producto)
        self.assertEqual(movimiento.tipo, 'entrada')
        self.assertEqual(movimiento.cantidad, 20)
    
    def test_crear_movimiento_salida(self):
        """Test: Creación de movimiento de salida"""
        movimiento = self.service.crear_movimiento(
            producto=self.producto,
            tipo='salida',
            cantidad=15
        )
        
        self.assertEqual(movimiento.tipo, 'salida')
    
    def test_obtener_movimientos_por_producto(self):
        """Test: Obtener movimientos de un producto"""
        self.service.crear_movimiento(self.producto, 'entrada', 10)
        self.service.crear_movimiento(self.producto, 'salida', 5)
        
        movimientos = self.service.obtener_movimientos_por_producto(
            self.producto.id
        )
        
        self.assertEqual(len(movimientos), 2)


# ==============================================================================
# TESTS DE API (INTEGRACIÓN)
# ==============================================================================

class StockAPITest(APITestCase):
    """Pruebas de integración para la API de Stock"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.client = APIClient()
        self.admin = Administrador.objects.create_superuser(
            username='admin',
            password='admin123'
        )
        self.client.force_authenticate(user=self.admin)
        
        self.producto = StockItem.objects.create(
            nombre="Producto API Test",
            descripcion="Test",
            precio=Decimal("100.00"),
            cantidad=50
        )
    
    def test_listar_productos(self):
        """Test: GET /api/stock/ lista productos"""
        url = reverse('stockitem-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_crear_producto(self):
        """Test: POST /api/stock/ crea producto"""
        url = reverse('stockitem-list')
        data = {
            'nombre': 'Nuevo Producto',
            'descripcion': 'Nueva descripción',
            'precio': '150.00',
            'cantidad': 30
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StockItem.objects.count(), 2)
    
    def test_restar_stock_api(self):
        """Test: PUT /api/stock/{id}/subtract/ resta stock"""
        url = reverse('stockitem-subtract-stock', args=[self.producto.id])
        data = {'cantidad': 20}
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.cantidad, 30)
    
    def test_agregar_stock_api(self):
        """Test: PUT /api/stock/{id}/restock/ agrega stock"""
        url = reverse('stockitem-restock', args=[self.producto.id])
        data = {'cantidad': 25}
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.cantidad, 75)


class AuthenticationAPITest(APITestCase):
    """Pruebas de autenticación JWT"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.client = APIClient()
        self.admin = Administrador.objects.create_user(
            username='testuser',
            password='testpass123'
        )
    
    def test_obtener_token(self):
        """Test: POST /api/auth/login/ obtiene token JWT"""
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_acceso_sin_autenticacion(self):
        """Test: Acceso denegado sin autenticación"""
        url = reverse('stockitem-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)