import pytest
from rest_framework.test import APIClient
from stock.models import StockItem


@pytest.fixture
def api_client():
  return APIClient()


@pytest.mark.django_db
def test_add_product_creates_item(api_client):
  payload = {
    "codigo": "SKU-123",
    "nombre": "Producto demo",
    "descripcion": "Descripcion",
    "precio": "9.99",
    "cantidad": "5",
  }
  resp = api_client.post("/api/stock/", payload, format="json")
  assert resp.status_code in (201, 200)
  item = StockItem.objects.get(codigo="SKU-123")
  assert item.precio == pytest.approx(9.99)
  assert item.cantidad == 5
