from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    statement = select(User).where(
        User.email == email,
    )

    return db.scalar(statement)


def create_user(
    db: Session,
    *,
    email: str,
    password: str,
) -> User:
    user = User(
        email=email,
        password_hash=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user