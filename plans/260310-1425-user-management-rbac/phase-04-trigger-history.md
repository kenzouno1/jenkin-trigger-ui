---
phase: 4
title: "Trigger History"
status: pending
priority: P2
effort: 3h
depends_on: [3]
---

# Phase 4 — Trigger History

## Overview
Track every build trigger action. Records who triggered what, when, with which parameters. Viewable by admin (all history) and users (own history).

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/trigger-history | Any | Own history (user) / all history (admin) |
| GET | /api/trigger-history/{job_name} | Any | History for specific job |
| POST | /api/trigger-history | Internal | Record a trigger event |

## Implementation Steps

- [ ] 1. Create `app/schemas/trigger_history.py`
  - TriggerRecord (id, user_id, username, job_name, build_number, parameters, triggered_at, status)
  - TriggerCreate (job_name, parameters, build_number?)
  - TriggerHistoryResponse (items: list, total: int, page: int)
- [ ] 2. Create `app/services/trigger_history.py`
  - `record_trigger(db, user_id, job_name, params, build_number?)` → record
  - `get_history(db, user_id?, job_name?, page, limit)` → paginated
  - `update_build_number(db, record_id, build_number)` → update
- [ ] 3. Create `app/routers/trigger_history.py`
  - GET / — paginated list, filtered by role (admin=all, user=own)
  - GET /{job_name} — filter by job name
- [ ] 4. Update Next.js trigger API route to call FastAPI to record trigger
  - After successful Jenkins trigger, POST to FastAPI /api/trigger-history
  - Include parameters snapshot and build number if available
- [ ] 5. Add trigger history tab/section to Next.js UI

## Query Parameters
- `page` (default: 1)
- `limit` (default: 20)
- `job_name` (filter)
- `user_id` (admin only filter)

## Success Criteria
- Every trigger records user, job, params, timestamp
- Users see own trigger history
- Admin sees all trigger history
- Paginated with filters
