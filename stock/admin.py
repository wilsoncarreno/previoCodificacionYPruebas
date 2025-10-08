from django.contrib import admin
from .models import StockItem, Movimiento, Administrador

# Registrar StockItem
admin.site.register(StockItem)

# Registrar Movimiento
@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ['id', 'producto', 'tipo', 'cantidad', 'fecha', 'hora']
    list_filter = ['tipo', 'fecha']
    search_fields = ['producto__nombre']
    readonly_fields = ['fecha', 'hora']
    ordering = ['-fecha', '-hora']

# Registrar Administrador
admin.site.register(Administrador)