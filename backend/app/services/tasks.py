from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import (
    Task,
    TaskPriority,
    TaskStatus,
)


def create_task(
    db: Session,
    *,
    project_id: UUID,
    title: str,
    description: str | None,
    priority: TaskPriority,
) -> Task:
    task = Task(
        project_id=project_id,
        title=title,
        description=description,
        priority=priority,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


def list_project_tasks(
    db: Session,
    *,
    project_id: UUID,
) -> list[Task]:
    statement = (
        select(Task)
        .where(
            Task.project_id == project_id,
        )
        .order_by(Task.created_at.desc())
    )

    return list(db.scalars(statement).all())


def get_task(
    db: Session,
    *,
    task_id: UUID,
    project_id: UUID,
) -> Task | None:
    statement = select(Task).where(
        Task.id == task_id,
        Task.project_id == project_id,
    )

    return db.scalar(statement)


def update_task(
    db: Session,
    *,
    task: Task,
    title: str | None,
    description: str | None,
    status: TaskStatus | None,
    priority: TaskPriority | None,
) -> Task:
    if title is not None:
        task.title = title

    if description is not None:
        task.description = description

    if status is not None:
        task.status = status

    if priority is not None:
        task.priority = priority

    db.commit()
    db.refresh(task)

    return task


def delete_task(
    db: Session,
    *,
    task: Task,
) -> None:
    db.delete(task)
    db.commit()