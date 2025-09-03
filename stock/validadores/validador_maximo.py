from stock.modelo import StockItem
from validadores.validador_base import BaseStockValidator
class MaximumStockValidator(BaseStockValidator):
    
    
    def __init__(self, maximum: int = 9999):
        self.maximum = maximum
    
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        return item.cantidad + cantidad <= self.maximum