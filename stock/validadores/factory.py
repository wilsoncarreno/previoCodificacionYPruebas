from stock.modelo import StockItem
from validadores.validador_base import BaseStockValidator
from validadores.validador_maximo import MaximumStockValidator
from validadores.validador_minimo import MinimumStockValidator
from validadores.validador_positivo import PositiveStockValidator
class StockValidatorFactory:
        
    @staticmethod
    def create_validator(validator_type: str, **kwargs) -> BaseStockValidator:
        validators = {
            'positive': PositiveStockValidator,
            'minimum': lambda: MinimumStockValidator(kwargs.get('minimum', 0)),
            'maximum': lambda: MaximumStockValidator(kwargs.get('maximum', 9999))
        }
        
        if validator_type not in validators:
            raise ValueError(f"Tipo de validador no válido: {validator_type}")
        
        validator_class = validators[validator_type]
        return validator_class() if callable(validator_class) else validator_class