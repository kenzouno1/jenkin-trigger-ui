from typing import Literal, Optional

from pydantic import BaseModel, field_validator


class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    role: Literal["user", "admin"]
    is_active: bool

    model_config = {"from_attributes": True}
