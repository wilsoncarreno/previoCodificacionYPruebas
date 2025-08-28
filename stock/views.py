from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Administrador, StockItem, Movimiento
from .serializers import StockSerializer, AdministradorSerializer, MovimientoSerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset = StockItem.objects.all()
    serializer_class = StockSerializer

    # Acción para RESTAR stock
    @action(detail=True, methods=['put'], url_path='subtract')
    def subtract_stock(self, request, pk=None):
        try:
            item = self.get_object()
            cantidad = request.data.get('cantidad')

            if cantidad is None:
                return Response({'error': 'Se requiere cantidad'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                cantidad = int(cantidad)
            except ValueError:
                return Response({'error': 'Cantidad debe ser un número entero'}, status=status.HTTP_400_BAD_REQUEST)

            if item.cantidad < cantidad:
                return Response({'error': 'Stock insuficiente'}, status=status.HTTP_400_BAD_REQUEST)

            item.cantidad -= cantidad
            item.save()

            # Crear movimiento automáticamente
            Movimiento.objects.create(producto=item, tipo='salida', cantidad=cantidad)

            return Response({'mensaje': 'Stock reducido', 'nuevo_stock': item.cantidad}, status=200)

        except StockItem.DoesNotExist:
            return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    # Acción para SUMAR stock
    @action(detail=True, methods=['put'], url_path='restock')
    def restock(self, request, pk=None):
        try:
            item = self.get_object()
            cantidad = request.data.get('cantidad')

            if cantidad is None:
                return Response({'error': 'Se requiere cantidad'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                cantidad = int(cantidad)
            except ValueError:
                return Response({'error': 'Cantidad debe ser un número entero'}, status=status.HTTP_400_BAD_REQUEST)

            item.cantidad += cantidad
            item.save()

            # Crear movimiento automáticamente
            Movimiento.objects.create(producto=item, tipo='entrada', cantidad=cantidad)

            return Response({'mensaje': 'Stock actualizado', 'nuevo_stock': item.cantidad}, status=200)

        except StockItem.DoesNotExist:
            return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)


class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = Administrador.objects.all()
    serializer_class = AdministradorSerializer

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all().order_by('-fecha', '-hora')
    serializer_class = MovimientoSerializer
