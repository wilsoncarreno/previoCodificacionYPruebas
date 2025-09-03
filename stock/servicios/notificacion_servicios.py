import logging
from stock.modelo.stock_item import StockItem
from stock.modelo.movimiento import Movimiento
class NotificationService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def notify_low_stock(self, producto: StockItem):
        
        self.logger.warning(
            f"Stock bajo detectado: {producto.nombre} "
            f"(Actual: {producto.cantidad}, Mínimo: {producto.stock_minimo})"
        )
    
    def notify_movement_processed(self, movement: Movimiento):
        
        self.logger.info(f"Movimiento procesado exitosamente: {movement}")