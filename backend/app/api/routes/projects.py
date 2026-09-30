from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.membership import WorkspaceRole
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
)
from app.services.projects import (
    create_project,
    delete_project,
    get_project,
    list_workspace_projects,
    update_project,
)
from app.services.workspaces import get_workspace_membership


router = APIRouter()


@router.post(
    "",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
)
def create(
    workspace_id: UUID,
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
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

    if membership.role not in {
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create projects.",
        )

    return create_project(
        db,
        workspace_id=workspace_id,
        name=payload.name,
        description=payload.description,
    )


@router.get(
    "",
    response_model=list[ProjectRead],
)
def list_projects(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectRead]:
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

    return list_workspace_projects(
        db,
        workspace_id=workspace_id,
    )


@router.patch(
    "/{project_id}",
    response_model=ProjectRead,
)
def update(
    workspace_id: UUID,
    project_id: UUID,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
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

    if membership.role not in {
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update projects.",
        )

    project = get_project(
        db,
        project_id=project_id,
        workspace_id=workspace_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return update_project(
        db,
        project=project,
        name=payload.name,
        description=payload.description,
    )


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    workspace_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
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

    if membership.role != WorkspaceRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the workspace owner can delete projects.",
        )

    project = get_project(
        db,
        project_id=project_id,
        workspace_id=workspace_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    delete_project(
        db,
        project=project,
    )