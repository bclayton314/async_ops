def register_and_login(
    client,
    *,
    email: str,
    password: str = "password123",
) -> str:
    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
        },
    )

    response = client.post(
        "/api/auth/login",
        data={
            "username": email,
            "password": password,
        },
    )

    return response.json()["access_token"]


def auth_headers(token: str):
    return {
        "Authorization": f"Bearer {token}",
    }


def create_workspace(client, token: str):
    response = client.post(
        "/api/workspaces",
        headers=auth_headers(token),
        json={
            "name": "Engineering",
            "slug": "engineering",
        },
    )

    return response.json()

def test_owner_can_create_project(client):
    token = register_and_login(
        client,
        email="owner@example.com",
    )

    workspace = create_workspace(
        client,
        token,
    )

    response = client.post(
        f"/api/workspaces/{workspace['id']}/projects",
        headers=auth_headers(token),
        json={
            "name": "AsyncOps MVP",
            "description": "Finish the MVP.",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "AsyncOps MVP"


def test_user_can_list_projects(client):
    token = register_and_login(
        client,
        email="owner@example.com",
    )

    workspace = create_workspace(client, token)

    client.post(
        f"/api/workspaces/{workspace['id']}/projects",
        headers=auth_headers(token),
        json={
            "name": "Project One",
        },
    )

    response = client.get(
        f"/api/workspaces/{workspace['id']}/projects",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_outsider_cannot_list_projects(client):
    owner_token = register_and_login(
        client,
        email="owner@example.com",
    )

    outsider_token = register_and_login(
        client,
        email="outsider@example.com",
    )

    workspace = create_workspace(
        client,
        owner_token,
    )

    response = client.get(
        f"/api/workspaces/{workspace['id']}/projects",
        headers=auth_headers(outsider_token),
    )

    assert response.status_code == 404