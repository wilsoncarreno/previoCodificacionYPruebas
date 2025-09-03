from django.db import models
from stock.modelo.stock_item import StockItem
from stock.modelo.movimiento import Movimiento
class StockReportService:
        
    @staticmethod
    def productos_stock_bajo():
        """Obtiene productos con stock bajo"""
        return StockItem.objects.filter(
            cantidad__lte=models.F('stock_minimo'),
            activo=True
        )
    
    @staticmethod
    def valor_total_inventario():
        productos = StockItem.objects.filter(activo=True)
        return sum(p.valor_total_stock() for p in productos)
    
    @staticmethod
    def movimientos_por_producto(producto_id: int):
        return Movimiento.objects.filter(
            producto_id=producto_id
        ).select_related('producto', 'created_by')