def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "test@example.com"
    assert data["is_active"] is True

    assert "id" in data
    assert "created_at" in data

    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email_returns_409(client):
    payload = {
        "email": "test@example.com",
        "password": "password123",
    }

    first_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert second_response.status_code == 409

    assert second_response.json() == {
        "detail": "A user with this email already exists.",
    }

def test_register_rejects_invalid_email(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "password": "password123",
        },
    )

    assert response.status_code == 422


def test_register_rejects_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "short",
        },
    )

    assert response.status_code == 422

def register_test_user(client):
    return client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )


def test_login_returns_access_token(client):
    register_test_user(client)

    response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_rejects_wrong_password(client):
    register_test_user(client)

    response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail": "Incorrect email or password.",
    }


def test_login_rejects_unknown_email(client):
    response = client.post(
        "/api/auth/login",
        data={
            "username": "missing@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 401

def login_test_user(client):
    register_test_user(client)

    response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123",
        },
    )

    return response.json()["access_token"]


def test_me_returns_current_user(client):
    token = login_test_user(client)

    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "test@example.com"
    assert data["is_active"] is True


def test_me_rejects_missing_token(client):
    response = client.get(
        "/api/auth/me",
    )

    assert response.status_code == 401


def test_me_rejects_invalid_token(client):
    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": "Bearer definitely-not-a-real-token",
        },
    )

    assert response.status_code == 401
