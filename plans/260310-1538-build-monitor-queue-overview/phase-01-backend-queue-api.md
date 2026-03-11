# Phase 1: Backend - Queue & Running Builds API

## Priority: High | Status: Pending

## Overview
Add endpoints to fetch Jenkins build queue and currently running builds.

## Key Insights
- Jenkins `/queue/api/json` returns all queued items
- Running builds = jobs where `color` ends with `_anime`
- Existing `jenkins_service.py` has `_jenkins_get_json` helper ready to use

## Implementation Steps

### 1. Add queue fetch to `jenkins_service.py`
Add function `fetch_queue(settings) -> list[dict]`:
- Call `/queue/api/json?tree=items[id,task[name,url,color],why,inQueueSince,buildableStartMilliseconds,stuck,blocked,params]`
- Return `data.get("items", [])`

### 2. Add running builds fetch to `jenkins_build_service.py`
Add function `fetch_running_builds(settings, job_names: list[str]) -> list[dict]`:
- For each running job, fetch latest build info
- Or simpler: reuse cached jobs list, filter `_anime`, fetch their lastBuild

### 3. Add router endpoints in `jenkins.py`
```python
@router.get("/queue")
def get_queue(...):
    """Get Jenkins build queue items."""

@router.get("/running")
def get_running_builds(...):
    """Get currently running builds across all jobs."""
```

## Files to Modify
- `backend/app/services/jenkins_service.py` — add `fetch_queue`
- `backend/app/services/jenkins_build_service.py` — add `fetch_running_builds`
- `backend/app/routers/jenkins.py` — add 2 endpoints

## Success Criteria
- `GET /api/jenkins/queue` returns queue items
- `GET /api/jenkins/running` returns running builds with progress info
