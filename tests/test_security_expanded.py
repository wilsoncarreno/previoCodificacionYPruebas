import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from stock.models import StockItem


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    User = get_user_model()
    return User.objects.create_user(username="sec_user", password="Very$tr0ngPass!")


@pytest.mark.django_db
def test_token_refresh_and_verify(api_client, user):
    # Obtain tokens
    resp = api_client.post("/api/auth/login/", {"username": "sec_user", "password": "Very$tr0ngPass!"}, format="json")
    assert resp.status_code == 200
    assert "access" in resp.data and "refresh" in resp.data

    refresh = resp.data["refresh"]
    # Refresh token
    resp2 = api_client.post("/api/auth/refresh/", {"refresh": refresh}, format="json")
    assert resp2.status_code == 200
    assert "access" in resp2.data

    access = resp2.data["access"]
    # Verify token
    resp3 = api_client.post("/api/auth/verify/", {"token": access}, format="json")
    # TokenVerifyView may return 200 with empty body or 204; accept success codes
    assert resp3.status_code in (200, 204)


@pytest.mark.django_db
def test_password_stored_hashed(user):
    # The stored password must not be the raw password and should contain a hashing marker
    raw = "Very$tr0ngPass!"
    assert user.password != raw
    # Django hashed passwords contain a separator with algorithm (e.g., 'pbkdf2_sha256$' or 'argon2$')
    assert "$" in user.password


@pytest.mark.django_db
def test_sql_like_codigo_is_safe():
    # Create a user and authenticated client manually to avoid fixture ambiguity
    client = APIClient()
    User = get_user_model()
    u = User.objects.create_user(username="sql_user", password="P4ssword!")
    client.force_authenticate(user=u)

    malicious_codigo = "SKU'; DROP TABLE stock_stockitem; --"
    payload = {
        "codigo": malicious_codigo,
        "nombre": "Producto Inyectado",
        "descripcion": "Intento SQL",
        "precio": "1.00",
        "cantidad": "1",
    }
    resp = client.post("/api/stock/", payload, format="json")
    # Expect creation (server treats it as a string) or a validation error but not a server error
    assert resp.status_code in (201, 200, 400)

    # If created, ensure the item exists as a record (string preserved)
    exists = StockItem.objects.filter(codigo=malicious_codigo).exists()
    assert exists or resp.status_code == 400
