from typing import Literal, Optional

from pydantic import BaseModel, field_validator


class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    role: Literal["user", "admin"] = "user"

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[Literal["user", "admin"]] = None
    is_active: Optional[bool] = None


class ResetPasswordRequest(BaseModel):
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v
