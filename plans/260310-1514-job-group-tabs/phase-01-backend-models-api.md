---
phase: 1
title: "Backend: Models + Migration + CRUD API"
status: pending
priority: P1
effort: 1.5h
---

# Phase 1: Backend Models + Migration + CRUD API

## Context Links
- Models dir: `backend/app/models/`
- Database: `backend/app/database.py` (SQLAlchemy, `Base = declarative_base()`)
- Main: `backend/app/main.py` (register router here)
- Dependencies: `backend/app/dependencies.py` (`require_admin` already exists)
- Existing pattern: see `backend/app/models/job_permission.py` for style reference

## Overview

Create two new tables, a service layer, and a CRUD router for job groups.

## Files to Create

### 1. `backend/app/models/job_group.py`

```python
import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class JobGroup(Base):
    __tablename__ = "job_groups"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    memberships: Mapped[list["JobGroupMembership"]] = relationship(
        "JobGroupMembership", back_populates="group", cascade="all, delete-orphan"
    )

class JobGroupMembership(Base):
    __tablename__ = "job_group_memberships"
    __table_args__ = (UniqueConstraint("group_id", "job_name", name="uq_group_job"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id: Mapped[str] = mapped_column(String, ForeignKey("job_groups.id"), nullable=False)
    job_name: Mapped[str] = mapped_column(String, nullable=False)

    group: Mapped["JobGroup"] = relationship("JobGroup", back_populates="memberships")
```

### 2. `backend/app/models/__init__.py` -- UPDATE

Add imports:
```python
from app.models.job_group import JobGroup, JobGroupMembership
```
Update `__all__` to include them.

### 3. `backend/app/services/job_group_service.py`

Functions (all take `db: Session`):
- `list_groups(db)` -> list of groups ordered by `display_order`, each with `job_names: list[str]`
- `create_group(db, name, display_order=0)` -> group
- `update_group(db, group_id, name=None, display_order=None)` -> group
- `delete_group(db, group_id)` -> None
- `set_group_jobs(db, group_id, job_names: list[str])` -> group with updated memberships

### 4. `backend/app/routers/job_groups.py`

```
router = APIRouter(prefix="/api/job-groups", tags=["job-groups"])
```

Endpoints:
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | any user | List all groups with job names |
| POST | `/` | admin | Create group `{name, display_order?}` |
| PUT | `/{id}` | admin | Update group `{name?, display_order?}` |
| DELETE | `/{id}` | admin | Delete group |
| PUT | `/{id}/jobs` | admin | Replace group jobs `{job_names: string[]}` |

Use `Depends(get_current_user)` for GET, `Depends(require_admin)` for mutations.

### 5. `backend/app/main.py` -- UPDATE

Add: `from app.routers.job_groups import router as job_groups_router`
Add: `app.include_router(job_groups_router)`

### 6. Alembic Migration

Run: `cd backend && alembic revision --autogenerate -m "add job_groups and job_group_memberships"`
Then: `alembic upgrade head`

## Implementation Steps

1. Create `backend/app/models/job_group.py` with both models
2. Update `backend/app/models/__init__.py` to import new models
3. Create `backend/app/services/job_group_service.py`
4. Create `backend/app/routers/job_groups.py`
5. Register router in `backend/app/main.py`
6. Generate and apply Alembic migration
7. Test endpoints with curl/httpie

## Todo

- [ ] Create JobGroup + JobGroupMembership models
- [ ] Update models __init__.py
- [ ] Create job_group_service.py
- [ ] Create job_groups router
- [ ] Register router in main.py
- [ ] Generate Alembic migration
- [ ] Verify endpoints work

## Success Criteria

- All 5 endpoints return correct responses
- Admin-only endpoints reject non-admin users with 403
- Deleting a group cascades to memberships
- Groups returned ordered by display_order
