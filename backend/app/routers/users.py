from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.user import ResetPasswordRequest, UserCreate, UserUpdate
from app.services.auth_service import hash_password
from app.services.user_service import (
    create_user,
    deactivate_user,
    get_all_users,
    get_user_by_email,
    get_user_by_id,
    get_user_by_username,
    update_user,
)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return get_all_users(db)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    body: UserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if get_user_by_username(db, body.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
    if get_user_by_email(db, body.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    return create_user(db, body)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_existing_user(
    user_id: str,
    body: UserUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    target = get_user_by_id(db, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if target.role == "admin" and body.is_active is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate admin users")
    user = update_user(db, user_id, body)
    return user


@router.put("/{user_id}/reset-password")
def reset_user_password(
    user_id: str,
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"ok": True}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_existing_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate your own account")
    target = get_user_by_id(db, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if target.role == "admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate admin users")
    deactivate_user(db, user_id)
