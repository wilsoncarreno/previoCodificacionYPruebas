import logging
from typing import List

from stock.modelo.stock_item import StockItem
from stock.modelo.movimiento import Movimiento
from protocolos.stock_validator_protocol import StockValidatorProtocol
from validadores.factory import StockValidatorFactory
from procesos.proceso_entrada import EntradaProcessor
from procesos.proceso_salida import SalidaProcessor
from validadores.validador_base import BaseStockValidator

class StockService:
    
    
    def __init__(self):
        self.validators = [
            StockValidatorFactory.create_validator('positive'),
            StockValidatorFactory.create_validator('minimum', minimum=0)
        ]
        
        
        self.entrada_processor = EntradaProcessor()
        self.salida_processor = SalidaProcessor()
        self.entrada_processor.set_next(self.salida_processor)
        
        self.logger = logging.getLogger(__name__)
    
    def add_validator(self, validator: BaseStockValidator):
        
        self.validators.append(validator)
    
    def validate_movement(self, item: 'StockItem', tipo: str, cantidad: int) -> bool:
        
        cantidad_cambio = cantidad if tipo == 'entrada' else -cantidad
        
        for validator in self.validators:
            if not validator.validate(item, cantidad_cambio):
                return False
        return True
    
    def process_movement(self, movement: 'Movimiento') -> bool:
        
        if not self.validate_movement(
            movement.producto, 
            movement.tipo, 
            movement.cantidad
        ):
            self.logger.warning(f"Movimiento inválido: {movement}")
            return False
        
        return self.entrada_processor.process(movement)