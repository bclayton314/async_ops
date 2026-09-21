from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.membership import WorkspaceMembership, WorkspaceRole
from app.models.user import User
from app.models.workspace import Workspace


def get_workspace_by_slug(
    db: Session,
    slug: str,
) -> Workspace | None:
    statement = select(Workspace).where(
        Workspace.slug == slug,
    )

    return db.scalar(statement)


def create_workspace(
    db: Session,
    *,
    name: str,
    slug: str,
    owner: User,
) -> Workspace:
    workspace = Workspace(
        name=name,
        slug=slug,
    )

    db.add(workspace)
    db.flush()

    membership = WorkspaceMembership(
        user_id=owner.id,
        workspace_id=workspace.id,
        role=WorkspaceRole.OWNER,
    )

    db.add(membership)

    db.commit()
    db.refresh(workspace)

    return workspace


def list_user_workspaces(
    db: Session,
    user: User,
) -> list[tuple[Workspace, WorkspaceRole]]:
    statement = (
        select(
            Workspace,
            WorkspaceMembership.role,
        )
        .join(
            WorkspaceMembership,
            WorkspaceMembership.workspace_id == Workspace.id,
        )
        .where(
            WorkspaceMembership.user_id == user.id,
        )
        .order_by(
            Workspace.created_at.desc(),
        )
    )

    return list(db.execute(statement).all())