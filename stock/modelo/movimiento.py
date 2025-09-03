from django.db import models
from django.core.exceptions import ValidationError
from .stock_item import StockItem
from .administrador import Administrador
from servicios.stock_servicio import StockService



class Movimiento(models.Model):
    
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]
    
    producto = models.ForeignKey(
        StockItem, 
        on_delete=models.CASCADE, 
        related_name='movimientos'
    )
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    cantidad = models.IntegerField()
    observaciones = models.TextField(blank=True)
    procesado = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        Administrador, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    
    _stock_service = None
    
    class Meta:
        verbose_name = 'Movimiento'
        verbose_name_plural = 'Movimientos'
        ordering = ['-fecha']
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.producto.nombre} ({self.cantidad})"
    
    @property
    def stock_service(self):
        
        if not self._stock_service:
            self._stock_service = StockService()
        return self._stock_service
    
    def clean(self):
        
        super().clean()
        if self.cantidad <= 0:
            raise ValidationError('La cantidad debe ser mayor a cero')
        
        if self.producto and not self.stock_service.validate_movement(
            self.producto, self.tipo, self.cantidad
        ):
            if self.tipo == 'salida':
                raise ValidationError('Stock insuficiente para la salida')
            else:
                raise ValidationError('Movimiento inválido')
    
    def save(self, *args, **kwargs):
        
        is_new = self.pk is None
        
        if is_new:
            self.full_clean()
        
        super().save(*args, **kwargs)
        
        if is_new and not self.procesado:
            if self.stock_service.process_movement(self):
                self.procesado = True
                super().save(update_fields=['procesado'])
                