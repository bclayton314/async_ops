from sqlalchemy import select

from app.models.membership import (
    WorkspaceMembership,
    WorkspaceRole,
)
from app.models.user import User


def register_and_login(
    client,
    *,
    email: str,
    password: str = "password123",
) -> str:
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        data={
            "username": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
    }

def create_workspace(
    client,
    token: str,
    *,
    name: str = "Engineering",
    slug: str = "engineering",
):
    response = client.post(
        "/api/workspaces",
        headers=auth_headers(token),
        json={
            "name": name,
            "slug": slug,
        },
    )

    assert response.status_code == 201

    return response.json()

def add_member(
    client,
    owner_token: str,
    workspace_id: str,
    *,
    email: str,
    role: str = "member",
):
    response = client.post(
        f"/api/workspaces/{workspace_id}/members",
        headers=auth_headers(owner_token),
        json={
            "email": email,
            "role": role,
        },
    )

    return response

def test_authenticated_user_can_create_workspace(client):
    token = register_and_login(
        client,
        email="owner@example.com",
    )

    response = client.post(
        "/api/workspaces",
        headers=auth_headers(token),
        json={
            "name": "Engineering",
            "slug": "engineering",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Engineering"
    assert data["slug"] == "engineering"
    assert "id" in data

def test_workspace_creation_requires_authentication(client):
    response = client.post(
        "/api/workspaces",
        json={
            "name": "Engineering",
            "slug": "engineering",
        },
    )

    assert response.status_code == 401

def test_workspace_creator_becomes_owner(client, db):
    token = register_and_login(
        client,
        email="owner@example.com",
    )

    response = client.post(
        "/api/workspaces",
        headers=auth_headers(token),
        json={
            "name": "Engineering",
            "slug": "engineering",
        },
    )

    assert response.status_code == 201

    user = db.scalar(
        select(User).where(
            User.email == "owner@example.com",
        )
    )

    membership = db.scalar(
        select(WorkspaceMembership).where(
            WorkspaceMembership.user_id == user.id,
        )
    )

    assert membership is not None
    assert membership.role == WorkspaceRole.OWNER

def test_duplicate_workspace_slug_returns_409(client):
    token = register_and_login(
        client,
        email="owner@example.com",
    )

    payload = {
        "name": "Engineering",
        "slug": "engineering",
    }

    first_response = client.post(
        "/api/workspaces",
        headers=auth_headers(token),
        json=payload,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/workspaces",
        headers=auth_headers(token),
        json={
            "name": "Another Engineering Team",
            "slug": "engineering",
        },
    )

    assert second_response.status_code == 409


def test_user_can_list_their_workspaces(client):
    token = register_and_login(
        client,
        email="owner@example.com",
    )

    client.post(
        "/api/workspaces",
        headers=auth_headers(token),
        json={
            "name": "Engineering",
            "slug": "engineering",
        },
    )

    response = client.get(
        "/api/workspaces",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["name"] == "Engineering"
    assert data[0]["slug"] == "engineering"
    assert data[0]["role"] == "owner"

def test_users_only_see_their_own_workspaces(client):
    user_one_token = register_and_login(
        client,
        email="user1@example.com",
    )

    user_two_token = register_and_login(
        client,
        email="user2@example.com",
    )

    response = client.post(
        "/api/workspaces",
        headers=auth_headers(user_one_token),
        json={
            "name": "User One Workspace",
            "slug": "user-one-workspace",
        },
    )

    assert response.status_code == 201

    user_one_response = client.get(
        "/api/workspaces",
        headers=auth_headers(user_one_token),
    )

    assert user_one_response.status_code == 200
    assert len(user_one_response.json()) == 1

    user_two_response = client.get(
        "/api/workspaces",
        headers=auth_headers(user_two_token),
    )

    assert user_two_response.status_code == 200
    assert user_two_response.json() == []

def test_member_cannot_add_workspace_members(client):
    owner_token = register_and_login(
        client,
        email="owner@example.com",
    )

    member_token = register_and_login(
        client,
        email="member@example.com",
    )

    register_and_login(
        client,
        email="third@example.com",
    )

    workspace = create_workspace(
        client,
        owner_token,
    )

    response = add_member(
        client,
        owner_token,
        workspace["id"],
        email="member@example.com",
    )

    assert response.status_code == 201

    response = add_member(
        client,
        member_token,
        workspace["id"],
        email="third@example.com",
    )

    assert response.status_code == 403

def test_owner_can_promote_member_to_admin(client):
    owner_token = register_and_login(
        client,
        email="owner@example.com",
    )

    register_and_login(
        client,
        email="member@example.com",
    )

    workspace = create_workspace(
        client,
        owner_token,
    )

    add_response = add_member(
        client,
        owner_token,
        workspace["id"],
        email="member@example.com",
    )

    assert add_response.status_code == 201

    user_id = add_response.json()["user_id"]

    response = client.patch(
        f"/api/workspaces/{workspace['id']}/members/{user_id}",
        headers=auth_headers(owner_token),
        json={
            "role": "admin",
        },
    )

    assert response.status_code == 200
    assert response.json()["role"] == "admin"

def test_owner_can_remove_member(client):
    owner_token = register_and_login(
        client,
        email="owner@example.com",
    )

    register_and_login(
        client,
        email="member@example.com",
    )

    workspace = create_workspace(
        client,
        owner_token,
    )

    add_response = add_member(
        client,
        owner_token,
        workspace["id"],
        email="member@example.com",
    )

    user_id = add_response.json()["user_id"]

    response = client.delete(
        f"/api/workspaces/{workspace['id']}/members/{user_id}",
        headers=auth_headers(owner_token),
    )

    assert response.status_code == 204

def test_workspace_owner_cannot_be_removed(client):
    owner_token = register_and_login(
        client,
        email="owner@example.com",
    )

    workspace = create_workspace(
        client,
        owner_token,
    )

    members_response = client.get(
        f"/api/workspaces/{workspace['id']}/members",
        headers=auth_headers(owner_token),
    )

    owner = members_response.json()[0]

    response = client.delete(
        f"/api/workspaces/{workspace['id']}/members/{owner['user_id']}",
        headers=auth_headers(owner_token),
    )

    assert response.status_code == 400
