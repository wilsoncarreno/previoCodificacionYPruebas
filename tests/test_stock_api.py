import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from stock.models import StockItem


@pytest.fixture
def user(db):
    User = get_user_model()
    return User.objects.create_user(username="testuser", password="testpassword")


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.mark.django_db
def test_unauthenticated_request_fails(api_client):
    resp = api_client.get("/api/stock/")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_add_product_creates_item(authenticated_client):
    payload = {
        "codigo": "SKU-123",
        "nombre": "Producto demo",
        "descripcion": "Descripcion",
        "precio": "9.99",
        "cantidad": "5",
    }
    resp = authenticated_client.post("/api/stock/", payload, format="json")
    assert resp.status_code in (201, 200)
    item = StockItem.objects.get(codigo="SKU-123")
    assert item.precio == pytest.approx(9.99)
    assert item.cantidad == 5


@pytest.mark.django_db
def test_add_product_duplicate_codigo_fails(authenticated_client):
    # Create a product first
    StockItem.objects.create(
        codigo="SKU-UNIQUE",
        nombre="Producto Unico",
        precio=10.00,
        cantidad=10
    )
    # Attempt to create another product with the same codigo
    payload = {
        "codigo": "SKU-UNIQUE",
        "nombre": "Producto Duplicado",
        "descripcion": "Descripcion",
        "precio": "20.00",
        "cantidad": "5",
    }
    resp = authenticated_client.post("/api/stock/", payload, format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_add_product_negative_quantity_fails(authenticated_client):
    resp = authenticated_client.post("/api/stock/", payload, format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_get_stock_list(authenticated_client):
    StockItem.objects.create(codigo="SKU-1", nombre="Producto 1", precio=10, cantidad=10)
    StockItem.objects.create(codigo="SKU-2", nombre="Producto 2", precio=20, cantidad=20)
    resp = authenticated_client.get("/api/stock/")
    assert resp.status_code == 200
    assert len(resp.data) == 2


@pytest.mark.django_db
def test_get_single_stock_item(authenticated_client):
    item = StockItem.objects.create(codigo="SKU-SINGLE", nombre="Producto Single", precio=15, cantidad=15)
    resp = authenticated_client.get(f"/api/stock/{item.id}/")
    assert resp.status_code == 200
    assert resp.data['codigo'] == "SKU-SINGLE"


@pytest.mark.django_db
def test_update_stock_item(authenticated_client):
    item = StockItem.objects.create(codigo="SKU-UPDATE", nombre="Producto Original", precio=25, cantidad=25)
    payload = {"nombre": "Producto Actualizado"}
    resp = authenticated_client.patch(f"/api/stock/{item.id}/", payload, format="json")
    assert resp.status_code == 200
    item.refresh_from_db()
    assert item.nombre == "Producto Actualizado"


@pytest.mark.django_db
def test_delete_stock_item(authenticated_client):
    item = StockItem.objects.create(codigo="SKU-DELETE", nombre="Producto a Borrar", precio=30, cantidad=30)
    resp = authenticated_client.delete(f"/api/stock/{item.id}/")
    assert resp.status_code == 204
    assert not StockItem.objects.filter(id=item.id).exists()

