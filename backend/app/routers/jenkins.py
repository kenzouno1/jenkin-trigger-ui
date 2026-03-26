from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.services import jenkins_service, permission_service
from app.services import jenkins_build_service
from app.services import job_cache_service
from app.services.trigger_history_service import record_trigger


class TriggerRequest(BaseModel):
    parameters: Optional[dict[str, str]] = None

router = APIRouter(prefix="/api/jenkins", tags=["jenkins"])


def _require_view(db: Session, user: User, job_name: str) -> None:
    if not permission_service.can_user_view_job(db, user.id, user.role, job_name):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this job")


def _require_trigger(db: Session, user: User, job_name: str) -> None:
    if not permission_service.can_user_trigger_job(db, user.id, user.role, job_name):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to trigger this job")


@router.get("/views")
def list_views(
    current_user: User = Depends(get_current_user),
):
    """List Jenkins views (job groups)."""
    try:
        return jenkins_service.fetch_views(settings)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.get("/queue")
def get_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get Jenkins build queue items, filtered by user permissions."""
    try:
        items = jenkins_service.fetch_queue(settings)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    allowed = permission_service.get_viewable_job_names(db, current_user.id, current_user.role)
    if allowed is None:
        return items
    return [item for item in items if item.get("task", {}).get("name") in allowed]


@router.get("/running")
def get_running_builds(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get currently running builds, filtered by user permissions."""
    try:
        all_jobs = job_cache_service.get_cached_jobs(db, settings)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    # Filter by permission first
    allowed = permission_service.get_viewable_job_names(db, current_user.id, current_user.role)
    running_names = [
        j["name"] for j in all_jobs
        if j.get("color", "").endswith("_anime") and (allowed is None or j["name"] in allowed)
    ]
    if not running_names:
        return []

    try:
        return jenkins_build_service.fetch_running_builds(settings, running_names)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.get("/jobs")
def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List Jenkins jobs from cache, filtered by user permissions."""
    try:
        all_jobs = job_cache_service.get_cached_jobs(db, settings)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    allowed = permission_service.get_viewable_job_names(db, current_user.id, current_user.role)
    if allowed is None:
        return {"jobs": all_jobs}
    return {"jobs": [j for j in all_jobs if j.get("name") in allowed]}


@router.get("/jobs/{name}")
def get_job(
    name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get job detail with parameters. GWT token kept server-side only."""
    _require_view(db, current_user, name)
    try:
        detail = jenkins_service.fetch_job_detail(settings, name)
        config_result = jenkins_service.fetch_job_config_params(settings, name)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    # Cache GWT info in DB for use during trigger
    job_cache_service.sync_job_gwt_info(db, settings, name)

    standard_params = jenkins_service.extract_standard_params(detail)
    parameters = standard_params if standard_params else config_result["params"]

    return {
        **detail,
        "parameters": parameters,
        "isGwt": config_result["is_gwt"],
        # gwtToken intentionally omitted — kept server-side only
    }


@router.post("/jobs/{name}/trigger")
def trigger_job(
    name: str,
    body: TriggerRequest = TriggerRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger a Jenkins build and record history. GWT token resolved server-side."""
    _require_trigger(db, current_user, name)

    params = body.parameters
    # Resolve GWT token from cache/Jenkins — never from client
    gwt_token = job_cache_service.get_gwt_token_for_job(db, settings, name)

    try:
        result = jenkins_build_service.trigger_build(settings, name, params, gwt_token)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    record_trigger(
        db,
        user_id=current_user.id,
        job_name=name,
        parameters=params,
        build_number=None,
    )

    return result


@router.post("/jobs/sync")
def sync_jobs(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Force refresh job cache from Jenkins (admin only)."""
    try:
        job_cache_service.sync_jobs_from_jenkins(db, settings)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    return {"status": "synced"}


@router.get("/jobs/{name}/builds")
def list_builds(
    name: str,
    limit: int = Query(default=20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get build history for a job."""
    _require_view(db, current_user, name)
    try:
        builds = jenkins_build_service.fetch_builds_history(settings, name, limit)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    return builds


@router.get("/builds/{name}/{number}")
def get_build(
    name: str,
    number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single build's info."""
    _require_view(db, current_user, name)
    try:
        return jenkins_build_service.fetch_build_info(settings, name, number)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.get("/builds/{name}/{number}/console")
def get_console(
    name: str,
    number: int,
    start: int = Query(default=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get progressive console output for a build."""
    _require_view(db, current_user, name)
    try:
        return jenkins_build_service.fetch_console_output(settings, name, number, start)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
