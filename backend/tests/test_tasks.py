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
    return client.post(
        "/api/workspaces",
        headers=auth_headers(token),
        json={
            "name": "Engineering",
            "slug": "engineering",
        },
    ).json()


def create_project(
    client,
    token: str,
    workspace_id: str,
):
    return client.post(
        f"/api/workspaces/{workspace_id}/projects",
        headers=auth_headers(token),
        json={
            "name": "AsyncOps MVP",
        },
    ).json()


def test_owner_can_create_and_update_task(client):
    token = register_and_login(
        client,
        email="owner@example.com",
    )

    workspace = create_workspace(
        client,
        token,
    )

    project = create_project(
        client,
        token,
        workspace["id"],
    )

    response = client.post(
        (
            f"/api/workspaces/{workspace['id']}"
            f"/projects/{project['id']}/tasks"
        ),
        headers=auth_headers(token),
        json={
            "title": "Finish MVP",
            "priority": "high",
        },
    )

    assert response.status_code == 201

    task = response.json()

    assert task["status"] == "todo"
    assert task["priority"] == "high"

    response = client.patch(
        (
            f"/api/workspaces/{workspace['id']}"
            f"/projects/{project['id']}"
            f"/tasks/{task['id']}"
        ),
        headers=auth_headers(token),
        json={
            "status": "done",
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == "done"


def test_outsider_cannot_list_tasks(client):
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

    project = create_project(
        client,
        owner_token,
        workspace["id"],
    )

    response = client.get(
        (
            f"/api/workspaces/{workspace['id']}"
            f"/projects/{project['id']}/tasks"
        ),
        headers=auth_headers(outsider_token),
    )

    assert response.status_code == 404