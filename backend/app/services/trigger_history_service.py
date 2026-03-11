import json
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.trigger_history import TriggerHistory
from app.models.user import User


def record_trigger(
    db: Session,
    user_id: str,
    job_name: str,
    parameters: Optional[dict],
    build_number: Optional[int],
) -> TriggerHistory:
    record = TriggerHistory(
        user_id=user_id,
        job_name=job_name,
        parameters=json.dumps(parameters) if parameters is not None else None,
        build_number=build_number,
        status="pending",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_history(
    db: Session,
    user_id: Optional[str] = None,
    job_name: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[dict], int]:
    stmt = (
        select(TriggerHistory, User.username)
        .join(User, TriggerHistory.user_id == User.id)
        .order_by(TriggerHistory.triggered_at.desc())
    )

    if user_id:
        stmt = stmt.where(TriggerHistory.user_id == user_id)
    if job_name:
        stmt = stmt.where(TriggerHistory.job_name == job_name)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar_one()

    offset = (page - 1) * limit
    rows = db.execute(stmt.offset(offset).limit(limit)).all()

    items = []
    for record, username in rows:
        items.append({
            "id": record.id,
            "user_id": record.user_id,
            "username": username,
            "job_name": record.job_name,
            "build_number": record.build_number,
            "parameters": json.loads(record.parameters) if record.parameters else None,
            "triggered_at": record.triggered_at,
            "status": record.status,
        })

    return items, total


def update_status(db: Session, record_id: str, status: str) -> bool:
    record = db.get(TriggerHistory, record_id)
    if not record:
        return False
    record.status = status
    db.commit()
    return True
