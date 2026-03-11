---
phase: 3
title: "RBAC & Job Permissions"
status: pending
priority: P1
effort: 4h
depends_on: [2]
---

# Phase 3 — RBAC & Job Permissions

## Overview
Implement per-user job permissions. Admin assigns which Jenkins jobs each user can view and/or trigger. Admin sees all jobs by default.

## API Endpoints

### Permissions (Admin only)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/permissions/{user_id} | Admin | Get user's job permissions |
| PUT | /api/permissions/{user_id} | Admin | Set user's job permissions (bulk) |
| GET | /api/permissions/jobs | Admin | List all Jenkins jobs (for assignment UI) |

### Filtered Jobs (Any authenticated)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/jobs | Any | List jobs user can view (filtered) |
| GET | /api/jobs/{name}/can-trigger | Any | Check if user can trigger this job |

## Permission Logic
```
Admin role → can view & trigger ALL jobs (no permission records needed)
User role → can only view/trigger jobs explicitly assigned in user_job_permissions
```

## Implementation Steps

- [ ] 1. Create `app/schemas/permission.py`
  - JobPermission (job_name, can_view, can_trigger)
  - UserPermissions (user_id, permissions: list[JobPermission])
  - BulkPermissionUpdate (permissions: list[JobPermission])
- [ ] 2. Create `app/services/permission.py`
  - `get_user_permissions(db, user_id)` → list of permissions
  - `set_user_permissions(db, user_id, permissions)` → bulk upsert
  - `can_user_view_job(db, user_id, role, job_name)` → bool
  - `can_user_trigger_job(db, user_id, role, job_name)` → bool
  - `filter_jobs_for_user(db, user_id, role, jobs)` → filtered list
- [ ] 3. Create `app/routers/permissions.py`
  - Admin endpoints for managing permissions
  - GET /jobs endpoint that filters based on user role + permissions
- [ ] 4. Update Next.js API route `/api/jenkins/jobs` to call FastAPI `/api/jobs` for filtered list
- [ ] 5. Update Next.js API route `/api/jenkins/jobs/[name]/trigger` to check `can-trigger` before proxying

## Data Flow
```
1. Admin → assigns jobs to user via admin panel
2. User logs in → Next.js calls FastAPI /api/jobs
3. FastAPI checks user_job_permissions → returns filtered jobs
4. User triggers build → Next.js checks /api/jobs/{name}/can-trigger
5. If allowed → Next.js proxies to Jenkins; else → 403
```

## Success Criteria
- Admin can assign job view/trigger permissions per user
- User only sees assigned jobs in job list
- Trigger blocked for unauthorized jobs (403)
- Admin sees all jobs regardless of permissions table
