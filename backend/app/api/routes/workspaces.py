from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceMemberAdd,
    WorkspaceMemberRead,
    WorkspaceRead,
    WorkspaceWithRole,
)
from app.services.users import get_user_by_email
from app.services.workspaces import (
    add_workspace_member,
    can_manage_members,
    create_workspace,
    get_workspace_by_slug,
    get_workspace_membership,
    list_user_workspaces,
    list_workspace_members,
)


router = APIRouter()


@router.post(
    "",
    response_model=WorkspaceRead,
    status_code=status.HTTP_201_CREATED,
)
def create(
    payload: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkspaceRead:
    existing_workspace = get_workspace_by_slug(
        db,
        payload.slug,
    )

    if existing_workspace is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A workspace with this slug already exists.",
        )

    return create_workspace(
        db,
        name=payload.name,
        slug=payload.slug,
        owner=current_user,
    )


@router.get(
    "",
    response_model=list[WorkspaceWithRole],
)
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[WorkspaceWithRole]:
    rows = list_user_workspaces(
        db,
        current_user,
    )

    return [
        WorkspaceWithRole(
            id=workspace.id,
            name=workspace.name,
            slug=workspace.slug,
            created_at=workspace.created_at,
            updated_at=workspace.updated_at,
            role=role,
        )
        for workspace, role in rows
    ]


@router.post(
    "/{workspace_id}/members",
    response_model=WorkspaceMemberRead,
    status_code=status.HTTP_201_CREATED,
)
def add_member(
    workspace_id: UUID,
    payload: WorkspaceMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkspaceMemberRead:
    current_membership = get_workspace_membership(
        db,
        workspace_id=workspace_id,
        user_id=current_user.id,
    )

    if current_membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found.",
        )

    if not can_manage_members(current_membership):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage workspace members.",
        )

    user = get_user_by_email(
        db,
        payload.email,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    existing_membership = get_workspace_membership(
        db,
        workspace_id=workspace_id,
        user_id=user.id,
    )

    if existing_membership is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a workspace member.",
        )

    membership = add_workspace_member(
        db,
        workspace=current_membership.workspace,
        user=user,
        role=payload.role,
    )

    return WorkspaceMemberRead(
        id=membership.id,
        user_id=user.id,
        email=user.email,
        role=membership.role,
        created_at=membership.created_at,
    )


@router.get(
    "/{workspace_id}/members",
    response_model=list[WorkspaceMemberRead],
)
def get_members(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[WorkspaceMemberRead]:
    membership = get_workspace_membership(
        db,
        workspace_id=workspace_id,
        user_id=current_user.id,
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found.",
        )

    rows = list_workspace_members(
        db,
        workspace_id=workspace_id,
    )

    return [
        WorkspaceMemberRead(
            id=workspace_membership.id,
            user_id=user.id,
            email=user.email,
            role=workspace_membership.role,
            created_at=workspace_membership.created_at,
        )
        for workspace_membership, user in rows
    ]