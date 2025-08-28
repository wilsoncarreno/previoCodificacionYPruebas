from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockViewSet, AdministradorViewSet,MovimientoViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'stock', StockViewSet)
router.register(r'administradores', AdministradorViewSet)
router.register(r'movimientos', MovimientoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
