from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project


def create_project(
    db: Session,
    *,
    workspace_id: UUID,
    name: str,
    description: str | None,
) -> Project:
    project = Project(
        workspace_id=workspace_id,
        name=name,
        description=description,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


def list_workspace_projects(
    db: Session,
    *,
    workspace_id: UUID,
) -> list[Project]:
    statement = (
        select(Project)
        .where(
            Project.workspace_id == workspace_id,
        )
        .order_by(Project.created_at.desc())
    )

    return list(db.scalars(statement).all())


def get_project(
    db: Session,
    *,
    project_id: UUID,
    workspace_id: UUID,
) -> Project | None:
    statement = select(Project).where(
        Project.id == project_id,
        Project.workspace_id == workspace_id,
    )

    return db.scalar(statement)


def update_project(
    db: Session,
    *,
    project: Project,
    name: str | None,
    description: str | None,
) -> Project:
    if name is not None:
        project.name = name

    if description is not None:
        project.description = description

    db.commit()
    db.refresh(project)

    return project


def delete_project(
    db: Session,
    *,
    project: Project,
) -> None:
    db.delete(project)
    db.commit()