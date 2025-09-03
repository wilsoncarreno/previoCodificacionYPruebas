from abc import ABC, abstractmethod
from modelo.movimiento import ABC, Movimiento
import logging
class BaseMovementProcessor(ABC):
    
    
    def __init__(self):
        self._next_processor = None
        self.logger = logging.getLogger(__name__)
    
    def set_next(self, processor: 'BaseMovementProcessor'):
        self._next_processor = processor
        return processor
    
    @abstractmethod
    def can_handle(self, movement: 'Movimiento') -> bool:
        pass
    
    @abstractmethod
    def handle(self, movement: 'Movimiento') -> bool:
        pass
    
    def process(self, movement: 'Movimiento') -> bool:
        if self.can_handle(movement):
            return self.handle(movement)
        elif self._next_processor:
            return self._next_processor.process(movement)
        return False