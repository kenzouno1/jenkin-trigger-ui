from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import require_admin
from app.schemas.permission import BulkPermissionUpdate, JobPermissionSchema, UserPermissionsResponse
from app.services import permission_service, jenkins_service
from app.services.user_service import get_user_by_id

router = APIRouter(prefix="/api/permissions", tags=["permissions"])


@router.get("/jobs", dependencies=[Depends(require_admin)])
def list_all_jenkins_jobs():
    """List all Jenkins jobs (for permission assignment UI)."""
    try:
        jobs = jenkins_service.fetch_all_jenkins_jobs(settings)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    return {"jobs": jobs}


@router.get("/{user_id}", response_model=UserPermissionsResponse, dependencies=[Depends(require_admin)])
def get_user_permissions(user_id: str, db: Session = Depends(get_db)):
    """Get a user's job permissions."""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    perms = permission_service.get_user_permissions(db, user_id)
    return UserPermissionsResponse(
        user_id=user_id,
        permissions=[JobPermissionSchema.model_validate(p) for p in perms],
    )


@router.put("/{user_id}", response_model=UserPermissionsResponse, dependencies=[Depends(require_admin)])
def set_user_permissions(user_id: str, body: BulkPermissionUpdate, db: Session = Depends(get_db)):
    """Bulk replace a user's job permissions."""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    perms = permission_service.set_user_permissions(db, user_id, body.permissions)
    return UserPermissionsResponse(
        user_id=user_id,
        permissions=[JobPermissionSchema.model_validate(p) for p in perms],
    )
