from stock.modelo import StockItem
from validadores.validador_base import BaseStockValidator
class MinimumStockValidator(BaseStockValidator):
    
    
    def __init__(self, minimum: int = 0):
        self.minimum = minimum
    
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        return item.cantidad + cantidad >= self.minimum