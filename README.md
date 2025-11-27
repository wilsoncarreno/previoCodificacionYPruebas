# Inventory Management System

## Executive overview
- Django + DRF backend with JWT auth, MySQL, and clear separation (services, validators, exceptions).
- React frontend with pastel dashboard, inline actions (edit/delete) and a single modal for price/quantity; movement history for entries, exits, and adjustments.
- Shared Axios client for API + token refresh and basic pagination.

## Key refactors and benefits
- Full movement logging: creation, quantity changes (entry/exit), and price changes (adjustment) recorded in backend.
- Simplified dashboard: removed redundant tabs; edit/delete from the table with reusable modal and status banners.
- Front services: centralized calls with pagination and error handling; readable date/time in movements.
- UI: light/pastel palette, bold typography, reusable modal/banner components.
- Front tests: stock/movement services mocked for fetch/update/delete and ordering/pagination.

## How to run (local)
### Backend
- Requirements: Python 3.11+, MySQL running with DB `stockmanagerdb` (see `.env`).
- Install deps: `pip install -r requirements.txt`
- Migrate DB: `python manage.py migrate`
- Optional admin: `python manage.py createsuperuser`
- Run: `python manage.py runserver 0.0.0.0:8000`

### Frontend
- From `frontend/`: `npm install`
- Dev server: `npm start` (http://localhost:3000)
- API config: set `REACT_APP_API_URL` or adjust `frontend/src/config/env.js` (default http://127.0.0.1:8000)

### Tests
- Backend: `pytest` or `python manage.py test`
- Front services: `cd frontend && npm test -- stockService.test.js movementService.test.js`

## Tech stack
- Backend: Django 5.2.1, DRF 3.15.2, simplejwt, MySQL.
- Frontend: React 18, Axios, Webpack.
- Tooling: pytest/pytest-django/pytest-cov, babel/webpack, jest.
