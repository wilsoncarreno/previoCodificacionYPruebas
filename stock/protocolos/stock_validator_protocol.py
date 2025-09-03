from typing import Protocol
from modelo.stock_item import StockItem

class StockValidatorProtocol(Protocol):
    
    def validate(self, item: 'StockItem', cantidad: int) -> bool:
        ...