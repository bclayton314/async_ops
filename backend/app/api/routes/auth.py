from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserCreate, UserRead
from app.services.users import create_user, get_user_by_email
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token
from app.schemas.auth import Token
from app.services.users import authenticate_user
from app.api.dependencies import get_current_user
from app.models.user import User


router = APIRouter()


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
) -> UserRead:
    existing_user = get_user_by_email(
        db,
        payload.email,
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    return create_user(
        db,
        email=payload.email,
        password=payload.password,
    )

@router.post(
    "/login",
    response_model=Token,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    user = authenticate_user(
        db,
        email=form_data.username,
        password=form_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    access_token = create_access_token(
        subject=str(user.id),
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
    )

@router.get(
    "/me",
    response_model=UserRead,
)
def me(
    current_user: User = Depends(get_current_user),
) -> UserRead:
    return current_user
