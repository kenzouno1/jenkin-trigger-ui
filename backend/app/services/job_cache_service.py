"""Service to cache Jenkins jobs in local DB and serve from cache."""

import time
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config import Settings
from app.models.cached_job import CachedJob
from app.services import jenkins_service

# Cache TTL in seconds — jobs are refreshed if older than this
CACHE_TTL_SECONDS = 60


def _is_cache_stale(db: Session) -> bool:
    """Check if any cached job is older than TTL."""
    latest = db.query(CachedJob.updated_at).order_by(CachedJob.updated_at.desc()).first()
    if not latest:
        return True
    age = datetime.utcnow() - latest[0]
    return age > timedelta(seconds=CACHE_TTL_SECONDS)


def sync_jobs_from_jenkins(db: Session, settings: Settings) -> None:
    """Fetch all jobs from Jenkins and upsert into cached_jobs table."""
    raw_jobs = jenkins_service.fetch_all_jenkins_jobs(settings)

    existing_map: dict[str, CachedJob] = {
        cj.name: cj for cj in db.query(CachedJob).all()
    }
    seen_names: set[str] = set()

    for job in raw_jobs:
        name = job.get("name", "")
        if not name:
            continue
        seen_names.add(name)

        last_build = job.get("lastBuild") or {}
        cached = existing_map.get(name)

        if cached:
            cached.url = job.get("url", "")
            cached.color = job.get("color", "notbuilt")
            cached.full_name = job.get("fullName", "")
            cached.description = job.get("description", "")
            cached.last_build_number = last_build.get("number")
            cached.last_build_timestamp = last_build.get("timestamp")
            cached.last_build_duration = last_build.get("duration")
            cached.last_build_result = last_build.get("result")
            cached.updated_at = datetime.utcnow()
        else:
            cached = CachedJob(
                name=name,
                url=job.get("url", ""),
                color=job.get("color", "notbuilt"),
                full_name=job.get("fullName", ""),
                description=job.get("description", ""),
                last_build_number=last_build.get("number"),
                last_build_timestamp=last_build.get("timestamp"),
                last_build_duration=last_build.get("duration"),
                last_build_result=last_build.get("result"),
            )
            db.add(cached)

    # Remove jobs no longer in Jenkins
    stale_names = set(existing_map.keys()) - seen_names
    if stale_names:
        db.query(CachedJob).filter(CachedJob.name.in_(stale_names)).delete(synchronize_session=False)

    db.commit()


def sync_job_gwt_info(db: Session, settings: Settings, job_name: str) -> CachedJob | None:
    """Fetch and cache GWT token info for a single job. Returns the cached job."""
    cached = db.query(CachedJob).filter(CachedJob.name == job_name).first()
    if not cached:
        return None

    config_result = jenkins_service.fetch_job_config_params(settings, job_name)
    cached.is_gwt = config_result["is_gwt"]
    cached.gwt_token = config_result["token"]
    cached.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(cached)
    return cached


def get_cached_jobs(db: Session, settings: Settings) -> list[dict]:
    """Get jobs from cache, refreshing if stale."""
    if _is_cache_stale(db):
        try:
            sync_jobs_from_jenkins(db, settings)
        except RuntimeError:
            pass  # Serve stale cache if Jenkins is down

    jobs = db.query(CachedJob).order_by(CachedJob.name).all()
    return [_cached_job_to_dict(j) for j in jobs]


def get_gwt_token_for_job(db: Session, settings: Settings, job_name: str) -> str | None:
    """Get GWT token for a job, fetching from Jenkins if not cached."""
    cached = db.query(CachedJob).filter(CachedJob.name == job_name).first()
    if cached and cached.gwt_token:
        return cached.gwt_token

    # Fetch and cache GWT info
    cached = sync_job_gwt_info(db, settings, job_name)
    return cached.gwt_token if cached else None


def _cached_job_to_dict(job: CachedJob) -> dict:
    """Convert CachedJob to API response dict (never includes gwt_token)."""
    result: dict = {
        "name": job.name,
        "url": job.url,
        "color": job.color,
        "fullName": job.full_name,
        "description": job.description,
    }
    if job.last_build_number is not None:
        result["lastBuild"] = {
            "number": job.last_build_number,
            "timestamp": job.last_build_timestamp,
            "duration": job.last_build_duration,
            "result": job.last_build_result,
        }
    else:
        result["lastBuild"] = None
    return result
