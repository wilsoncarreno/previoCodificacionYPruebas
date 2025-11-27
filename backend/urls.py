"""
URL configuration for backend project with optional Swagger documentation.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)
from rest_framework_simplejwt.views import (
    TokenObtainPairView, 
    TokenRefreshView,
    TokenVerifyView
)

def root_view(request):
    logger.info("root_view requested: %s %s", request.method, request.path)
    return JsonResponse({
        "message": "Backend desplegado correctamente",
        "api_base": "/api/",
        "auth_endpoints": {
            "login": "/api/auth/login/",
            "refresh": "/api/auth/refresh/",
            "verify": "/api/auth/verify/",
        }
    })

urlpatterns = [
    # Raíz
    path("", root_view, name="root"),

    # Admin
    path("admin/", admin.site.urls),

    # API
    path("api/", include("stock.urls")),

    # Autenticación JWT
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/verify/", TokenVerifyView.as_view(), name="token_verify"),
]

# TEMPORAL: fallback para cualquier ruta no encontrada.
# Esto ayuda a diagnosticar por qué la raíz devuelve 404 en el despliegue.
# Mantén esto solo mientras depuramos; retirarlo en producción si no es necesario.
from django.urls import re_path
urlpatterns += [
    re_path(r'^.*$', root_view, name='root_fallback'),
]
