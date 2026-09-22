from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, EmailStr
from app.models.membership import WorkspaceRole


class WorkspaceCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    slug: str = Field(
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )


class WorkspaceMembershipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role: WorkspaceRole


class WorkspaceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    created_at: datetime
    updated_at: datetime


class WorkspaceWithRole(WorkspaceRead):
    role: WorkspaceRole

class WorkspaceMemberAdd(BaseModel):
    email: EmailStr
    role: WorkspaceRole = WorkspaceRole.MEMBER


class WorkspaceMemberRead(BaseModel):
    id: UUID
    user_id: UUID
    email: EmailStr
    role: WorkspaceRole
    created_at: datetime