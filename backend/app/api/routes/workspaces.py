from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceRead,
    WorkspaceWithRole,
)
from app.services.workspaces import (
    create_workspace,
    get_workspace_by_slug,
    list_user_workspaces,
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