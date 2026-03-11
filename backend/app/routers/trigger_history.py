from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.trigger_history import TriggerCreate, TriggerHistoryResponse, TriggerRecord
from app.services.trigger_history_service import get_history, record_trigger

router = APIRouter(prefix="/api/trigger-history", tags=["trigger-history"])


@router.get("", response_model=TriggerHistoryResponse)
def list_trigger_history(
    page: int = 1,
    limit: int = 20,
    job_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = None if current_user.role == "admin" else current_user.id
    items, total = get_history(db, user_id=user_id, job_name=job_name, page=page, limit=limit)
    return TriggerHistoryResponse(
        items=[TriggerRecord(**item) for item in items],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=TriggerRecord, status_code=status.HTTP_201_CREATED)
def create_trigger_record(
    body: TriggerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = record_trigger(
        db,
        user_id=current_user.id,
        job_name=body.job_name,
        parameters=body.parameters,
        build_number=body.build_number,
    )
    return TriggerRecord(
        id=record.id,
        user_id=record.user_id,
        username=current_user.username,
        job_name=record.job_name,
        build_number=record.build_number,
        parameters=body.parameters,
        triggered_at=record.triggered_at,
        status=record.status,
    )
