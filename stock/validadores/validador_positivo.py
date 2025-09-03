from abc import ABC, abstractmethod
from stock.modelo import StockItem
from validadores.validador_base import BaseStockValidator

class PositiveStockValidator(BaseStockValidator):
    
    
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        return item.cantidad + cantidad >= 0