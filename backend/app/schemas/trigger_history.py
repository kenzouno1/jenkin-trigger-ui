from datetime import datetime

from pydantic import BaseModel


class TriggerCreate(BaseModel):
    job_name: str
    parameters: dict | None = None
    build_number: int | None = None


class TriggerRecord(BaseModel):
    id: str
    user_id: str
    username: str
    job_name: str
    build_number: int | None
    parameters: dict | None
    triggered_at: datetime
    status: str

    model_config = {"from_attributes": True}


class TriggerHistoryResponse(BaseModel):
    items: list[TriggerRecord]
    total: int
    page: int
    limit: int
