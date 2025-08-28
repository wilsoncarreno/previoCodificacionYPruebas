from rest_framework import serializers
from .models import StockItem, Administrador, Movimiento

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockItem
        fields = '__all__'

class AdministradorSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Administrador
        fields = ['username', 'password']

    def create(self, validated_data):
        user = Administrador.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
class MovimientoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_descripcion = serializers.ReadOnlyField(source='producto.descripcion')
    producto_precio = serializers.ReadOnlyField(source='producto.precio')

    class Meta:
        model = Movimiento
        fields = ['id', 'tipo', 'producto', 'producto_nombre', 'producto_descripcion', 'producto_precio', 'cantidad', 'fecha', 'hora']
        read_only_fields = ['producto_nombre', 'producto_descripcion', 'producto_precio']

        