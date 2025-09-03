 # 📦 Inventory Management System

This project is an **inventory management system** built with **Django** and **Django REST Framework (DRF)**.  
It allows registering and managing products, handling administrator users with different permission levels, and monitoring stock movements efficiently.

---

## 🚀 Main Features

### 🔑 Authentication and User Management
- Implementation of a **custom user model** based on `AbstractBaseUser` and `PermissionsMixin`.
- Administrators include:
  - `username`
  - `is_active`
  - `is_staff`
  - `is_superuser`
- Permission management and authentication using **JWT tokens** (`token_obtain_pair`).
- `AdminUserManager` with methods to:
  - Create users (`create_user`).
  - Create superusers (`create_superuser`).

### 📦 Product Management (StockItem)
- Register products with:
  - Name
  - Description
  - Price
  - Quantity in stock
- Track and control available products.

### 📊 Stock Movements
- Record **incoming** and **outgoing** product operations.
- Direct relationship with `StockItem` (via `ForeignKey`).
- `type` field to identify movement as **input** or **output**.
- Automatic logging of stock operations.

### ⚙️ Core Endpoints
- **StockViewSet**  
  - Reduce product quantity via `PUT` request.  
  - Validates stock availability before update.  
  - Automatically registers an **output** movement.  

- **AdministratorViewSet**  
  - CRUD endpoints to list, create, update, and delete administrators.  

- **MovimientoViewSet**  
  - Retrieve stock movements sorted by **date and time (descending)**.  

---

## 📡 APIs
The system provides a set of APIs ready to be integrated with a **frontend application** (e.g., React), enabling:
- Real-time stock adjustments.  
- Movement history queries.  
- Administrator management with role-based permissions.  

---

## 🏗️ Technologies Used
- **Python 3**
- **Django**
- **Django REST Framework (DRF)**
- **JWT Authentication**

---

## 📄 Conclusion
This system is a complete **inventory management solution** that:
- Registers and manages products.  
- Provides a detailed log of stock movements.  
- Includes a user management module with multiple permission levels.  
- Exposes APIs that make it easy to integrate with modern frontend applications.  
