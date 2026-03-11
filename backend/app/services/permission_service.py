from sqlalchemy.orm import Session

from app.models.job_permission import UserJobPermission
from app.schemas.permission import JobPermissionSchema


def get_user_permissions(db: Session, user_id: str) -> list[UserJobPermission]:
    return db.query(UserJobPermission).filter(UserJobPermission.user_id == user_id).all()


def set_user_permissions(db: Session, user_id: str, permissions: list[JobPermissionSchema]) -> list[UserJobPermission]:
    db.query(UserJobPermission).filter(UserJobPermission.user_id == user_id).delete()

    new_records = [
        UserJobPermission(
            user_id=user_id,
            job_name=p.job_name,
            can_view=p.can_view,
            can_trigger=p.can_trigger,
        )
        for p in permissions
    ]
    db.add_all(new_records)
    db.commit()
    for r in new_records:
        db.refresh(r)
    return new_records


def can_user_view_job(db: Session, user_id: str, role: str, job_name: str) -> bool:
    if role == "admin":
        return True
    record = (
        db.query(UserJobPermission)
        .filter(UserJobPermission.user_id == user_id, UserJobPermission.job_name == job_name)
        .first()
    )
    return record is not None and record.can_view


def can_user_trigger_job(db: Session, user_id: str, role: str, job_name: str) -> bool:
    if role == "admin":
        return True
    record = (
        db.query(UserJobPermission)
        .filter(UserJobPermission.user_id == user_id, UserJobPermission.job_name == job_name)
        .first()
    )
    return record is not None and record.can_trigger


def get_viewable_job_names(db: Session, user_id: str, role: str) -> list[str] | None:
    """Returns None for admin (all jobs allowed), or list of permitted job names for regular users."""
    if role == "admin":
        return None
    records = (
        db.query(UserJobPermission)
        .filter(UserJobPermission.user_id == user_id, UserJobPermission.can_view == True)  # noqa: E712
        .all()
    )
    return [r.job_name for r in records]
