from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class AdminUserManager(BaseUserManager):
    def create_user(self, username, password=None):
        if not username:
            raise ValueError('El usuario debe tener un nombre de usuario')
        user = self.model(username=username)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password):
        user = self.create_user(username, password)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user

class Administrador(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    

    objects = AdminUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username


# Modelo Productos
class StockItem(models.Model):
    codigo = models.CharField(max_length=50, unique=True, null=True, blank=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.IntegerField(default=0)

    def __str__(self):
        return self.nombre
    
# Modelo Movimientos de Stock
class Movimiento(models.Model):
    Tipo_Choices = (
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
    )
    producto = models.ForeignKey(StockItem, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=10, choices = Tipo_Choices)
    cantidad = models.IntegerField()
    fecha = models.DateTimeField(auto_now_add=True)
    hora = models.TimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo.capitalize()} - {self.producto.nombre} ({self.cantidad})"
