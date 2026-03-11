import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CachedJob(Base):
    """Cache of Jenkins jobs to avoid frequent API calls."""

    __tablename__ = "cached_jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    color: Mapped[str] = mapped_column(String(50), nullable=False, default="notbuilt")
    full_name: Mapped[str] = mapped_column(String(255), nullable=True, default="")
    description: Mapped[str] = mapped_column(Text, nullable=True, default="")
    # Last build info (denormalized for fast listing)
    last_build_number: Mapped[int] = mapped_column(Integer, nullable=True)
    last_build_timestamp: Mapped[int] = mapped_column(Integer, nullable=True)
    last_build_duration: Mapped[int] = mapped_column(Integer, nullable=True)
    last_build_result: Mapped[str] = mapped_column(String(20), nullable=True)
    # GWT metadata — token stored server-side only, never exposed to frontend
    is_gwt: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    gwt_token: Mapped[str] = mapped_column(String(255), nullable=True)
    # Cache metadata
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
