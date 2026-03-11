---
title: "Jenkins-Style Job Group Tabs"
description: "Add views/tabs to organize jobs into groups like Jenkins views UI"
status: pending
priority: P2
effort: 4h
branch: feat/job-group-tabs
tags: [feature, frontend, backend, database]
created: 2026-03-10
---

# Job Group Tabs - Implementation Plan

## Summary

Add Jenkins-style views/tabs to the dashboard so users can filter jobs by group.
Tab bar: "All" | "BAHADI" | "BDS" | ... | "+" (admin-only create button).

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | Backend: Models + Migration + CRUD API | pending | 1.5h |
| 2 | Frontend: Hook + Tab Bar Component | pending | 1.5h |
| 3 | Frontend: Admin Group Management | pending | 1h |

## Architecture

```
JobGroup (id, name, display_order, created_at)
  |-- 1:N --> JobGroupMembership (id, group_id, job_name)

GET    /api/job-groups              -- list all groups (any auth user)
POST   /api/job-groups              -- create group (admin)
PUT    /api/job-groups/{id}         -- update group name/order (admin)
DELETE /api/job-groups/{id}         -- delete group + memberships (admin)
PUT    /api/job-groups/{id}/jobs    -- set job list for group (admin)
```

## Key Decisions

- Groups are app-level, not per-user
- Jobs can belong to multiple groups
- "All" tab is virtual (no DB row), always first
- Group tabs respect existing user job permissions (filter client-side)
- `display_order` integer for tab ordering
