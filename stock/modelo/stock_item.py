from decimal import Decimal
from django.db import models
from django.forms import ValidationError
class StockItem(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    stock_maximo = models.IntegerField(default=9999)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

    def clean(self):
        super().clean()
        if self.precio < 0:
            raise ValidationError('El precio no puede ser negativo')
        if self.cantidad < 0:
            raise ValidationError('La cantidad no puede ser negativa')
        if self.stock_minimo < 0:
            raise ValidationError('El stock mínimo no puede ser negativo')
        if self.stock_maximo <= self.stock_minimo:
            raise ValidationError('El stock máximo debe ser mayor al mínimo')

    def tiene_stock_bajo(self) -> bool:
        return self.cantidad <= self.stock_minimo

    def puede_retirar(self, cantidad: int) -> bool:
        return self.cantidad >= cantidad

    def valor_total_stock(self) -> Decimal:
        return Decimal(str(self.cantidad)) * self.precio
    
    