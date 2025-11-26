from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
import logging

from .models import Administrador, StockItem, Movimiento
from .serializers import StockSerializer, AdministradorSerializer, MovimientoSerializer

logger = logging.getLogger(__name__)


class StockViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD de productos en stock.
    """
    queryset = StockItem.objects.all()
    serializer_class = StockSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        item = serializer.save()
        if item.cantidad and item.cantidad != 0:
            Movimiento.objects.create(producto=item, tipo='entrada', cantidad=item.cantidad)

    def perform_update(self, serializer):
        item = self.get_object()
        old_cantidad = item.cantidad
        old_precio = item.precio
        updated_item = serializer.save()

        # Registrar cambio de cantidad
        delta = updated_item.cantidad - old_cantidad
        if delta != 0:
            Movimiento.objects.create(
                producto=updated_item,
                tipo='entrada' if delta > 0 else 'salida',
                cantidad=abs(delta)
            )

        # Registrar cambio de precio
        if updated_item.precio != old_precio:
            Movimiento.objects.create(
                producto=updated_item,
                tipo='ajuste',
                cantidad=0
            )

    @action(detail=True, methods=['put'], url_path='subtract')
    def subtract_stock(self, request, pk=None):
        """
        Resta stock de un producto y crea movimiento de SALIDA
        """
        try:
            item = self.get_object()
            cantidad = request.data.get('cantidad')

            if cantidad is None:
                return Response(
                    {'error': 'Se requiere cantidad'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                cantidad = int(cantidad)
            except ValueError:
                return Response(
                    {'error': 'Cantidad debe ser un número entero'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if item.cantidad < cantidad:
                return Response(
                    {'error': 'Stock insuficiente'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Restar stock
            item.cantidad -= cantidad
            item.save()

            # ✅ CREAR MOVIMIENTO DE SALIDA
            movimiento = Movimiento.objects.create(
                producto=item,
                tipo='salida',
                cantidad=cantidad
            )

            logger.info(f"Stock reducido: {item.nombre} - {cantidad} unidades. Movimiento ID: {movimiento.id}")

            return Response({
                'mensaje': 'Stock reducido',
                'nuevo_stock': item.cantidad,
                'movimiento_id': movimiento.id
            }, status=status.HTTP_200_OK)

        except StockItem.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['put'], url_path='restock')
    def restock(self, request, pk=None):
        """
        Agrega stock a un producto y crea movimiento de ENTRADA
        """
        try:
            item = self.get_object()
            cantidad = request.data.get('cantidad')

            if cantidad is None:
                return Response(
                    {'error': 'Se requiere cantidad'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                cantidad = int(cantidad)
            except ValueError:
                return Response(
                    {'error': 'Cantidad debe ser un número entero'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Agregar stock
            item.cantidad += cantidad
            item.save()

            # ✅ CREAR MOVIMIENTO DE ENTRADA
            movimiento = Movimiento.objects.create(
                producto=item,
                tipo='entrada',
                cantidad=cantidad
            )

            logger.info(f"Stock agregado: {item.nombre} + {cantidad} unidades. Movimiento ID: {movimiento.id}")

            return Response({
                'mensaje': 'Stock actualizado',
                'nuevo_stock': item.cantidad,
                'movimiento_id': movimiento.id
            }, status=status.HTTP_200_OK)

        except StockItem.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = Administrador.objects.all()
    serializer_class = AdministradorSerializer
    permission_classes = [IsAdminUser]


class MovimientoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para consultar movimientos.
    """
    queryset = Movimiento.objects.all().order_by('-fecha', '-hora')
    serializer_class = MovimientoSerializer
    permission_classes = [AllowAny]
