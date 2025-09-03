from typing import Protocol
from modelo.stock_item import StockItem
from modelo.movimiento import Movimiento
class MovementProcessorProtocol(Protocol):
    
    def process(self, movement: 'Movimiento') -> bool:
        ...