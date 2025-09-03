from abc import ABC, abstractmethod
from procesos.proceso_base import BaseMovementProcessor
from modelo.movimiento import ABC, Movimiento
import logging
class EntradaProcessor(BaseMovementProcessor):
    
    
    def can_handle(self, movement: 'Movimiento') -> bool:
        return movement.tipo == 'entrada'
    
    def handle(self, movement: 'Movimiento') -> bool:
        try:
            movement.producto.cantidad += movement.cantidad
            movement.producto.save()
            self.logger.info(f"Entrada procesada: {movement}")
            return True
        except Exception as e:
            self.logger.error(f"Error procesando entrada: {e}")
            return False