from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.forms import ValidationError




class AdminUserManager(BaseUserManager):
    
    def _create_user(self, username: str, password: str = None, **extra_fields):
        
        if not username:
            raise ValueError('El usuario debe tener un nombre de usuario')
        
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_user(self, username: str, password: str = None, **extra_fields):
        
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_active', True)
        return self._create_user(username, password, **extra_fields)
    
    def create_superuser(self, username: str, password: str, **extra_fields):
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        
        return self._create_user(username, password, **extra_fields)

class Administrador(AbstractBaseUser, PermissionsMixin):
    
    username = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)     
    
    objects = AdminUserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    class Meta:
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'
    
    def __str__(self):
        return self.username
    
    def clean(self):
        
        super().clean()
        if self.username and len(self.username) < 3:
            raise ValidationError('El nombre de usuario debe tener al menos 3 caracteres')