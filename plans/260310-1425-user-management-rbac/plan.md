---
title: "User Management & RBAC"
description: "Add FastAPI Python backend for user management, role-based access control, per-user job permissions, and trigger history"
status: pending
priority: P1
effort: 20h
branch: feat/user-management-rbac
tags: [fastapi, python, auth, rbac, nextjs]
created: 2026-03-10
---

# User Management & RBAC — Implementation Plan

## Overview
Add FastAPI Python backend alongside existing Next.js frontend. Provides user management, JWT auth, role-based access (user|admin), per-user Jenkins job visibility/trigger permissions, and trigger history tracking.

## Current Architecture
- **Frontend:** Next.js 15 + React 19 + TanStack Query + shadcn/ui
- **Backend:** Next.js API routes proxy Jenkins API
- **Auth:** None (open access)
- **DB:** None (Jenkins is source of truth)

## Target Architecture
- **Frontend:** Next.js 15 (unchanged UI stack)
- **Auth Backend:** FastAPI (Python) — JWT auth, user CRUD, RBAC, trigger history
- **Database:** SQLite + SQLAlchemy + Alembic
- **Auth Flow:** JWT in httpOnly cookies, Next.js middleware guards pages
- **Jenkins Proxy:** Next.js API routes remain, but check auth via FastAPI

```
Browser → Next.js (pages + API routes) → FastAPI (auth/users/permissions)
                                       → Jenkins API (proxied, auth-gated)
```

## Key Decisions
1. **SQLite** — lightweight, no infra needed for internal tool
2. **JWT in httpOnly cookies** — secure, no localStorage exposure
3. **FastAPI separate process** — clean separation, Python ecosystem for auth
4. **Next.js API routes still proxy Jenkins** — but validate JWT first
5. **Admin manages users + job permissions** — admin panel in Next.js

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| username | VARCHAR(50) | unique |
| email | VARCHAR(100) | unique |
| hashed_password | VARCHAR | bcrypt |
| role | ENUM(user,admin) | default: user |
| is_active | BOOLEAN | default: true |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### user_job_permissions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| job_name | VARCHAR | Jenkins job name |
| can_view | BOOLEAN | default: true |
| can_trigger | BOOLEAN | default: false |

### trigger_history
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| job_name | VARCHAR | |
| build_number | INT | nullable (may not be available immediately) |
| parameters | JSON | trigger params snapshot |
| triggered_at | DATETIME | |
| status | VARCHAR | pending/success/failed |

## Phases

| # | Phase | Est. | Status |
|---|-------|------|--------|
| 1 | [FastAPI Project Setup](phase-01-fastapi-setup.md) | 3h | pending |
| 2 | [Auth & User Management](phase-02-auth-user-management.md) | 4h | pending |
| 3 | [RBAC & Job Permissions](phase-03-rbac-job-permissions.md) | 4h | pending |
| 4 | [Trigger History](phase-04-trigger-history.md) | 3h | pending |
| 5 | [Next.js Auth Integration](phase-05-nextjs-auth-integration.md) | 4h | pending |
| 6 | [Admin Panel UI](phase-06-admin-panel-ui.md) | 4h | pending |

## Dependencies
- Python 3.11+ installed
- pnpm (already used for Next.js)
