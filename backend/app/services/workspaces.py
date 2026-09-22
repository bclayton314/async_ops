from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.membership import WorkspaceMembership, WorkspaceRole
from app.models.user import User
from app.models.workspace import Workspace
from uuid import UUID

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

def get_workspace_membership(
    db: Session,
    *,
    workspace_id: UUID,
    user_id: UUID,
) -> WorkspaceMembership | None:
    statement = select(WorkspaceMembership).where(
        WorkspaceMembership.workspace_id == workspace_id,
        WorkspaceMembership.user_id == user_id,
    )

    return db.scalar(statement)


def add_workspace_member(
    db: Session,
    *,
    workspace: Workspace,
    user: User,
    role: WorkspaceRole,
) -> WorkspaceMembership:
    membership = WorkspaceMembership(
        workspace_id=workspace.id,
        user_id=user.id,
        role=role,
    )

    db.add(membership)
    db.commit()
    db.refresh(membership)

    return membership


def list_workspace_members(
    db: Session,
    *,
    workspace_id: UUID,
):
    statement = (
        select(
            WorkspaceMembership,
            User,
        )
        .join(
            User,
            User.id == WorkspaceMembership.user_id,
        )
        .where(
            WorkspaceMembership.workspace_id == workspace_id,
        )
        .order_by(User.email)
    )

    return list(db.execute(statement).all())

def can_manage_members(
    membership: WorkspaceMembership,
) -> bool:
    return membership.role in {
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
    }