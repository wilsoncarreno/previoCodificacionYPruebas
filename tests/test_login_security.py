import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
  return APIClient()


@pytest.fixture
def user(db):
  User = get_user_model()
  return User.objects.create_user(username="admin_test", password="StrongPass123")


@pytest.mark.django_db
def test_login_ok_returns_tokens(api_client, user):
  resp = api_client.post("/api/auth/login/", {"username": "admin_test", "password": "StrongPass123"}, format="json")
  assert resp.status_code == 200
  assert "access" in resp.data
  assert "refresh" in resp.data


@pytest.mark.django_db
def test_login_missing_username_returns_400(api_client):
  resp = api_client.post("/api/auth/login/", {"password": "x"}, format="json")
  assert resp.status_code == 400


@pytest.mark.django_db
def test_login_missing_password_returns_400(api_client):
  resp = api_client.post("/api/auth/login/", {"username": "foo"}, format="json")
  assert resp.status_code == 400


@pytest.mark.django_db
def test_login_invalid_credentials_returns_401(api_client, user):
  resp = api_client.post("/api/auth/login/", {"username": "admin_test", "password": "wrong"}, format="json")
  assert resp.status_code in (400, 401)
