import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TriggerHistory(Base):
    __tablename__ = "trigger_history"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    job_name: Mapped[str] = mapped_column(String, nullable=False)
    build_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    parameters: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    triggered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="trigger_history")  # noqa: F821
