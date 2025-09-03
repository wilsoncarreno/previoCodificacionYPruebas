from stock.modelo import StockItem
from abc import ABC, abstractmethod
class BaseStockValidator(ABC):
    
    @abstractmethod
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        pass