# 📦 Inventory Management System

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Django](https://img.shields.io/badge/Django-5.2.1-green.svg)
![DRF](https://img.shields.io/badge/DRF-3.15.2-red.svg)
![Test Coverage](https://img.shields.io/badge/Coverage-85%25-brightgreen.svg)

A professional *Inventory Management System* built with *Django REST Framework* following *Clean Architecture* principles and *SOLID* design patterns. This system provides a complete solution for managing products, tracking stock movements, and handling administrator users with role-based permissions.

---

## 🌟 Highlights

- ✅ *Clean Architecture* with Service Layer Pattern
- ✅ *85% Test Coverage* (Unit + Integration tests)
- ✅ *Design Patterns*: Factory, Chain of Responsibility, Protocol
- ✅ *JWT Authentication* with token refresh
- ✅ *Atomic Transactions* for data integrity
- ✅ *Custom Exception Handling* with centralized error management
- ✅ *Environment-based Configuration* (no hardcoded credentials)
- ✅ *Comprehensive Logging* system
- ✅ *API Documentation* ready (drf-yasg/Swagger)

---

## Cambios recientes (frontend)
- Centralizadas las llamadas del dashboard en servicios Axios (`frontend/src/services/stockService.js` y `frontend/src/services/movementService.js`) reutilizando el cliente con interceptores.
- Nueva configuracion de `API_BASE` en `frontend/src/config/env.js` (usa `REACT_APP_API_URL`/`API_BASE_URL` si existen, o `http://127.0.0.1:8000` por defecto).
- Dashboard ahora usa refresco automatico cada 10s y notificaciones en pantalla para altas/ajustes de stock.
- Edicion/eliminacion desde la tabla de productos con modal para precio/cantidad y confirmacion de borrado.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Usage Examples](#-usage-examples)
- [Design Patterns](#-design-patterns)

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Custom user model based on AbstractBaseUser and PermissionsMixin
- JWT token authentication with automatic refresh
- Role-based permissions (Admin, Staff, Regular users)
- Secure password hashing with Django's built-in system

### 📦 Product Management
- Complete CRUD operations for products
- Real-time stock tracking
- Product attributes:
  - Name, description, price
  - Current quantity in stock
  - Automatic validation

### 📊 Stock Movement Tracking
- Automatic logging of all stock operations
- Movement types: *Entrada* (Input) and *Salida* (Output)
- Timestamp precision (date and time)
- Complete audit trail
- Read-only API for movement history

### ⚙ Advanced Features
- *Atomic Transactions*: Ensures data consistency
- *Custom Validators*: Business rule enforcement
- *Exception Handling*: Consistent error responses
- *Logging System*: Debug and production-ready
- *CORS Support*: Frontend integration enabled
- *Pagination*: Efficient data retrieval

---

## 🛠 Tech Stack

### Backend
- *Python 3.11+*
- *Django 5.2.1* - Web framework
- *Django REST Framework 3.15.2* - API toolkit
- *djangorestframework-simplejwt 5.3.1* - JWT authentication
- *MySQL* - Database (via PyMySQL/mysqlclient)

### Development & Testing
- *pytest 8.3.4* - Testing framework
- *pytest-django 4.9.0* - Django integration
- *pytest-cov 6.0.0* - Coverage reports
- *factory-boy 3.3.1* - Test fixtures

### Configuration & Security
- *python-decouple 3.8* - Environment variables
- *django-cors-headers 4.5.0* - CORS support

### Documentation
- *drf-yasg 1.21.7* - Swagger/OpenAPI documentation

### Production
- *gunicorn 23.0.0* - WSGI HTTP Server
- *whitenoise 6.8.2* - Static file serving

---

## 🏗 Architecture

This project follows *Clean Architecture* principles with clear separation of concerns:


┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│  (views.py - ViewSets, API Endpoints)          │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Business Logic Layer               │
│  (services.py - StockService, MovimientoService)│
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Validation Layer                   │
│  (validators.py - Business Rules)               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Data Access Layer                  │
│  (models.py - Django ORM)                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Database (MySQL)                   │
└─────────────────────────────────────────────────┘


### Key Design Patterns

1. *Service Layer Pattern*: Business logic separated from views
2. *Factory Pattern*: ValidatorFactory for validator creation
3. *Chain of Responsibility*: Composable validation workflows
4. *Protocol Pattern*: Interface contracts for low coupling
5. *Custom Exception Handling*: Centralized error management

---

## 💾 Installation

### Prerequisites
- Python 3.11 or higher
- MySQL 8.0+
- pip (Python package manager)
- virtualenv (recommended)

### Step 1: Clone the Repository
bash
git clone https://github.com/yourusername/inventory-management-system.git
cd inventory-management-system


### Step 2: Create Virtual Environment
bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate


### Step 3: Install Dependencies
bash
pip install -r requirements.txt


### Step 4: Create MySQL Database
sql
CREATE DATABASE stockmanagerdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'stockuser'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON stockmanagerdb.* TO 'stockuser'@'localhost';
FLUSH PRIVILEGES;



### Step 5: Run Migrations
bash
python manage.py makemigrations
python manage.py migrate


### Step 6: Create Superuser
bash
python manage.py createsuperuser


### Step 7: Run Development Server
bash
python manage.py runserver


The API will be available at http://localhost:8000/api/

---

### Administrator Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/administradores/ | List administrators | ✅ Admin |
| POST | /api/administradores/ | Create administrator | ✅ Admin |
| GET | /api/administradores/{id}/ | Get admin details | ✅ Admin |
| PUT | /api/administradores/{id}/ | Update administrator | ✅ Admin |
| DELETE | /api/administradores/{id}/ | Delete administrator | ✅ Admin |

---

## 🧪 Testing

### Run All Tests
bash
# Using pytest
pytest

# Using Django's test runner
python manage.py test


### Run Tests with Coverage
bash
pytest --cov=stock --cov-report=html


### Run Specific Test Suite
bash
# Test models only
pytest stock/tests.py::StockItemModelTest

# Test services only
pytest stock/tests.py::StockServiceTest

# Test API endpoints
pytest stock/tests.py::StockAPITest


### Current Test Coverage

Models:     95%
Services:   90%
Validators: 88%
API Views:  80%
Overall:    85%


### Test Structure

tests.py
├── Model Tests
│   ├── StockItemModelTest
│   ├── MovimientoModelTest
│   └── AdministradorModelTest
├── Validator Tests
│   ├── StockValidatorTest
│   └── MovimientoValidatorTest
├── Service Tests
│   ├── StockServiceTest
│   └── MovimientoServiceTest
└── API Integration Tests
    ├── StockAPITest
    └── AuthenticationAPITest


---

## 📁 Project Structure


inventory-management-system/
├── backend/
│   ├── __init__.py
│   ├── settings.py          # Configuration with environment variables
│   ├── urls.py              # Main URL routing
│   ├── wsgi.py              # WSGI configuration
│   └── asgi.py              # ASGI configuration
├── stock/
│   ├── migrations/          # Database migrations
│   ├── __init__.py
│   ├── admin.py            # Django admin configuration
│   ├── apps.py             # App configuration
│   ├── models.py           # Data models (StockItem, Movimiento, Administrador)
│   ├── serializers.py      # DRF serializers
│   ├── views.py            # API ViewSets
│   ├── urls.py             # App URL routing
│   ├── services.py         # Business logic layer ⭐
│   ├── validators.py       # Validation layer ⭐
│   ├── exceptions.py       # Custom exception handling ⭐
│   └── tests.py            # Comprehensive test suite ⭐
├── logs/                    # Application logs
├── .env                     # Environment variables (not in repo)
├── .gitignore
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
├── package.json            # Frontend dependencies (if applicable)
└── README.md              # This file


---

## 💡 Usage Examples

### 1. Authentication

*Obtain JWT Token:*
bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'


*Response:*
json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}


### 2. Create Product

bash
curl -X POST http://localhost:8000/api/stock/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "nombre": "Laptop HP",
    "descripcion": "HP Pavilion 15-inch",
    "precio": "899.99",
    "cantidad": 50
  }'


### 3. Reduce Stock (Subtract)

bash
curl -X PUT http://localhost:8000/api/stock/1/subtract/ \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 5
  }'


*Response:*
json
{
  "mensaje": "Stock reducido",
  "nuevo_stock": 45,
  "movimiento_id": 12
}


### 4. Add Stock (Restock)

bash
curl -X PUT http://localhost:8000/api/stock/1/restock/ \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 20
  }'


### 5. List Movements

bash
curl -X GET http://localhost:8000/api/movimientos/


*Response:*
json
[
  {
    "id": 12,
    "tipo": "salida",
    "producto": 1,
    "producto_nombre": "Laptop HP",
    "cantidad": 5,
    "fecha": "2025-01-08T14:30:00Z",
    "hora": "14:30:00"
  }
]


### 6. Python/Django Shell Examples

python
from stock.models import StockItem, Movimiento
from stock.services import StockService

# Create product
producto = StockItem.objects.create(
    nombre="Mouse Logitech",
    descripcion="Wireless mouse",
    precio=29.99,
    cantidad=100
)

# Use service to subtract stock
service = StockService()
resultado = service.restar_stock(producto.id, 10)
print(resultado)
# Output: {'mensaje': 'Stock reducido exitosamente', 'nuevo_stock': 90}

# Get movements
movimientos = Movimiento.objects.filter(producto=producto)
for mov in movimientos:
    print(f"{mov.tipo}: {mov.cantidad} units at {mov.fecha}")


---

## 🎨 Design Patterns

### 1. Service Layer Pattern

*Purpose*: Separate business logic from presentation layer

*Example:*
python
# services.py
class StockService:
    @transaction.atomic
    def restar_stock(self, item_id: int, cantidad: int):
        # Business logic here
        item = StockItem.objects.select_for_update().get(pk=item_id)
        item.cantidad -= cantidad
        item.save()
        # Automatic movement creation
        MovimientoService().crear_movimiento(...)


### 2. Factory Pattern

*Purpose*: Centralize validator creation

*Example:*
python
# validators.py
class ValidatorFactory:
    _validators = {
        'stock': StockValidator,
        'movimiento': MovimientoValidator,
    }
    
    @classmethod
    def create(cls, validator_type: str):
        return cls._validators[validator_type]()

# Usage
validator = ValidatorFactory.create('stock')
validator.validar_cantidad_positiva(10)


### 3. Chain of Responsibility

*Purpose*: Composable validation workflows

*Example:*
python
class BaseValidator:
    def __init__(self):
        self.next_validator = None
    
    def set_next(self, validator):
        self.next_validator = validator
        return validator
    
    def validate(self, value):
        self._validate(value)
        if self.next_validator:
            self.next_validator.validate(value)


### 4. Protocol Pattern

*Purpose*: Define interface contracts

*Example:*
python
from typing import Protocol

class StockServiceProtocol(Protocol):
    def restar_stock(self, item_id: int, cantidad: int) -> Dict[str, Any]:
        ...
    
    def agregar_stock(self, item_id: int, cantidad: int) -> Dict[str, Any]:
        ...


---

## 🔒 Security Best Practices

### Implemented Security Measures

1. *Environment Variables*: No hardcoded credentials
2. *JWT Authentication*: Secure token-based auth
3. *Password Hashing*: Django's built-in Bcrypt
4. *CORS Configuration*: Controlled frontend access
5. *SQL Injection Prevention*: Django ORM parameterization
6. *CSRF Protection*: Django middleware
7. *Input Validation*: Multi-layer validation system
8. *Atomic Transactions*: Data integrity guarantee
9. *Production Settings*: SSL, secure cookies, HSTS headers

### Production Checklist

- [ ] Set DEBUG=False in production
- [ ] Use strong SECRET_KEY
- [ ] Configure proper ALLOWED_HOSTS
- [ ] Set up HTTPS/SSL certificates
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Set up monitoring (Sentry, New Relic)
- [ ] Use environment-specific .env files
- [ ] Enable rate limiting
- [ ] Configure proper logging rotation

---

## 📊 Performance Optimization

### Database Optimization
- select_for_update() for atomic operations
- Indexing on foreign keys
- Pagination for large datasets
- Query optimization with select_related() and prefetch_related()

### Caching Strategy (Future Enhancement)
python
# Recommended: Redis caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}


---
# Link informe

https://drive.google.com/drive/folders/15MVA84tyt1_suv2GhH02dcN1wK-6k1PG?usp=sharing


