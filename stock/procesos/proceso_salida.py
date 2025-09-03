from abc import ABC, abstractmethod
from procesos.proceso_base import BaseMovementProcessor
from modelo.movimiento import ABC, Movimiento

class SalidaProcessor(BaseMovementProcessor):
    
    
    def can_handle(self, movement: 'Movimiento') -> bool:
        return movement.tipo == 'salida'
    
    def handle(self, movement: 'Movimiento') -> bool:
        if movement.producto.cantidad < movement.cantidad:
            self.logger.warning(f"Stock insuficiente para salida: {movement}")
            return False
        
        try:
            movement.producto.cantidad -= movement.cantidad
            movement.producto.save()
            self.logger.info(f"Salida procesada: {movement}")
            return True
        except Exception as e:
            self.logger.error(f"Error procesando salida: {e}")
            return False