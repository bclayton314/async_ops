from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.membership import WorkspaceRole
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskRead,
    TaskUpdate,
)
from app.services.projects import get_project
from app.services.tasks import (
    create_task,
    delete_task,
    get_task,
    list_project_tasks,
    update_task,
)
from app.services.workspaces import get_workspace_membership


router = APIRouter()


def require_workspace_membership(
    db: Session,
    *,
    workspace_id: UUID,
    user_id: UUID,
):
    membership = get_workspace_membership(
        db,
        workspace_id=workspace_id,
        user_id=user_id,
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found.",
        )

    return membership


def require_project(
    db: Session,
    *,
    workspace_id: UUID,
    project_id: UUID,
):
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

    return project


@router.post(
    "",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
def create(
    workspace_id: UUID,
    project_id: UUID,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskRead:
    membership = require_workspace_membership(
        db,
        workspace_id=workspace_id,
        user_id=current_user.id,
    )

    require_project(
        db,
        workspace_id=workspace_id,
        project_id=project_id,
    )

    if membership.role not in {
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create tasks.",
        )

    return create_task(
        db,
        project_id=project_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
    )


@router.get(
    "",
    response_model=list[TaskRead],
)
def list_tasks(
    workspace_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskRead]:
    require_workspace_membership(
        db,
        workspace_id=workspace_id,
        user_id=current_user.id,
    )

    require_project(
        db,
        workspace_id=workspace_id,
        project_id=project_id,
    )

    return list_project_tasks(
        db,
        project_id=project_id,
    )


@router.patch(
    "/{task_id}",
    response_model=TaskRead,
)
def update(
    workspace_id: UUID,
    project_id: UUID,
    task_id: UUID,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskRead:
    membership = require_workspace_membership(
        db,
        workspace_id=workspace_id,
        user_id=current_user.id,
    )

    require_project(
        db,
        workspace_id=workspace_id,
        project_id=project_id,
    )

    if membership.role not in {
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update tasks.",
        )

    task = get_task(
        db,
        task_id=task_id,
        project_id=project_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    return update_task(
        db,
        task=task,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
    )


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    workspace_id: UUID,
    project_id: UUID,
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    membership = require_workspace_membership(
        db,
        workspace_id=workspace_id,
        user_id=current_user.id,
    )

    require_project(
        db,
        workspace_id=workspace_id,
        project_id=project_id,
    )

    if membership.role != WorkspaceRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the workspace owner can delete tasks.",
        )

    task = get_task(
        db,
        task_id=task_id,
        project_id=project_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    delete_task(
        db,
        task=task,
    )