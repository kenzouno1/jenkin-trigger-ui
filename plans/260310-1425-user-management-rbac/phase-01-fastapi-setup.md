---
phase: 1
title: "FastAPI Project Setup"
status: pending
priority: P1
effort: 3h
---

# Phase 1 — FastAPI Project Setup

## Overview
Set up FastAPI Python backend with SQLite database, SQLAlchemy ORM, Alembic migrations, and project structure.

## Directory Structure
```
backend/
├── alembic/
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── config.py             # Settings (env vars)
│   ├── database.py           # SQLAlchemy engine + session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── job-permission.py
│   │   └── trigger-history.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── auth.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── permissions.py
│   │   └── trigger-history.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── user.py
│   └── dependencies.py       # Auth dependencies (get_current_user, etc.)
├── alembic.ini
├── requirements.txt
└── .env.example
```

## Requirements (requirements.txt)
```
fastapi==0.115.*
uvicorn[standard]==0.34.*
sqlalchemy==2.0.*
alembic==1.14.*
pydantic-settings==2.*
python-jose[cryptography]==3.3.*
passlib[bcrypt]==1.7.*
python-multipart==0.0.*
```

## Implementation Steps

- [ ] 1. Create `backend/` directory structure
- [ ] 2. Create `requirements.txt` with dependencies
- [ ] 3. Create `app/config.py` — Pydantic Settings loading from `.env`
  - DATABASE_URL (default: `sqlite:///./data.db`)
  - SECRET_KEY (JWT signing)
  - JENKINS_URL, JENKINS_USER, JENKINS_API_TOKEN
  - ACCESS_TOKEN_EXPIRE_MINUTES (default: 30)
- [ ] 4. Create `app/database.py` — SQLAlchemy engine + session factory
  - Use `create_engine` with `connect_args={"check_same_thread": False}` for SQLite
  - Async not needed for SQLite — use sync SQLAlchemy
- [ ] 5. Create SQLAlchemy models (user, job_permission, trigger_history)
- [ ] 6. Init Alembic and generate initial migration
- [ ] 7. Create `app/main.py` — FastAPI app with CORS middleware
  - Allow origins: `http://localhost:3000` (Next.js dev)
  - Allow credentials: true (for cookies)
- [ ] 8. Create seed script to create default admin user
- [ ] 9. Add `backend/` start script to `package.json` or document in README
- [ ] 10. Update `.env.example` with all required vars

## Success Criteria
- `uvicorn app.main:app --reload` starts without errors
- `/docs` (Swagger UI) accessible
- Database created with tables via Alembic migration
- Default admin user seeded

## Notes
- SQLite chosen — no extra infra for internal tool
- Sync SQLAlchemy sufficient for SQLite (no async driver needed)
- CORS must allow credentials for httpOnly cookie auth
