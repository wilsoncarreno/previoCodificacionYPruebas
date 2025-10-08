"""
Custom Exception Handler
Manejo centralizado de excepciones para respuestas consistentes
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Manejador personalizado de excepciones para DRF.
    Proporciona respuestas consistentes para todas las excepciones.
    
    Args:
        exc: Excepción capturada
        context: Contexto de la vista donde ocurrió la excepción
        
    Returns:
        Response con formato estandarizado de error
    """
    # Llamar al manejador por defecto de DRF
    response = exception_handler(exc, context)
    
    # Si DRF no maneja la excepción, la manejamos nosotros
    if response is None:
        # Manejo de ValidationError de Django
        if isinstance(exc, ValidationError):
            logger.error(f"ValidationError: {exc}")
            return Response(
                {
                    'error': 'Error de validación',
                    'detail': str(exc),
                    'success': False
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Manejo de excepciones personalizadas del servicio
        from .services import StockInsuficienteError, ProductoNoEncontradoError
        
        if isinstance(exc, StockInsuficienteError):
            logger.warning(f"StockInsuficienteError: {exc}")
            return Response(
                {
                    'error': 'Stock insuficiente',
                    'detail': str(exc),
                    'success': False
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if isinstance(exc, ProductoNoEncontradoError):
            logger.error(f"ProductoNoEncontradoError: {exc}")
            return Response(
                {
                    'error': 'Producto no encontrado',
                    'detail': str(exc),
                    'success': False
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Excepciones no manejadas
        logger.exception(f"Excepción no manejada: {exc}")
        return Response(
            {
                'error': 'Error interno del servidor',
                'detail': 'Ha ocurrido un error inesperado',
                'success': False
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Personalizar la respuesta de DRF
    response.data = {
        'error': response.data.get('detail', 'Error en la solicitud'),
        'detail': response.data,
        'success': False
    }
    
    return response