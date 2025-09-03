
from django.db import models


class StockItemQuerySet(models.QuerySet):
    
    
    def activos(self):
        return self.filter(activo=True)
    
    def con_stock_bajo(self):
        return self.filter(cantidad__lte=models.F('stock_minimo'))
    
    def sin_stock(self):
        return self.filter(cantidad=0)
    
    def por_categoria_precio(self, precio_min=None, precio_max=None):
        queryset = self
        if precio_min:
            queryset = queryset.filter(precio__gte=precio_min)
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)
        return queryset

class StockItemManager(models.Manager):
    
    
    def get_queryset(self):
        return StockItemQuerySet(self.model, using=self._db)
    
    def activos(self):
        return self.get_queryset().activos()
    
    def con_stock_bajo(self):
        return self.get_queryset().con_stock_bajo()