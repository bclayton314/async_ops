from unittest.mock import MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import get_db
from app.main import app


client = TestClient(app)


def override_db():
    db = MagicMock()
    yield db


def test_health_check_returns_healthy():
    app.dependency_overrides[get_db] = override_db

    response = client.get("/api/health")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "asyncops-api",
        "database": "connected",
    }


def test_health_check_returns_503_when_database_fails():
    db = MagicMock()
    db.execute.side_effect = SQLAlchemyError("Database unavailable")

    def override_failed_db():
        yield db

    app.dependency_overrides[get_db] = override_failed_db

    response = client.get("/api/health")

    app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Database unavailable",
    }