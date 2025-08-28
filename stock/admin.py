from django.contrib import admin
from .models import StockItem

class StockItemAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "cantidad", "precio")
    search_fields = ("nombre",)
admin.site.register(StockItem, StockItemAdmin)

