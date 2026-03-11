---
phase: 2
title: "Auth & User Management"
status: pending
priority: P1
effort: 4h
depends_on: [1]
---

# Phase 2 — Auth & User Management

## Overview
Implement JWT authentication (login/logout) and user CRUD operations. Admin can manage users; users can view/update own profile.

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | None | Login, returns JWT in httpOnly cookie |
| POST | /api/auth/logout | Any | Clear auth cookie |
| GET | /api/auth/me | Any | Get current user info |
| POST | /api/auth/change-password | Any | Change own password |

### Users (Admin only)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/users | Admin | List all users |
| POST | /api/users | Admin | Create user |
| GET | /api/users/{id} | Admin | Get user detail |
| PUT | /api/users/{id} | Admin | Update user (role, active) |
| DELETE | /api/users/{id} | Admin | Deactivate user |

## Implementation Steps

- [ ] 1. Create `app/schemas/auth.py`
  - LoginRequest (username, password)
  - TokenData (user_id, role)
  - UserResponse (id, username, email, role, is_active)
- [ ] 2. Create `app/schemas/user.py`
  - UserCreate (username, email, password, role)
  - UserUpdate (email?, role?, is_active?)
  - ChangePassword (current_password, new_password)
- [ ] 3. Create `app/services/auth.py`
  - `hash_password(plain)` → hashed (passlib bcrypt)
  - `verify_password(plain, hashed)` → bool
  - `create_access_token(data, expires)` → JWT string
  - `decode_token(token)` → TokenData
- [ ] 4. Create `app/dependencies.py`
  - `get_db()` — SQLAlchemy session dependency
  - `get_current_user(request)` — extract JWT from cookie, validate, return user
  - `require_admin(current_user)` — raise 403 if not admin
- [ ] 5. Create `app/routers/auth.py`
  - POST /login — verify credentials, set httpOnly cookie with JWT
  - POST /logout — clear cookie
  - GET /me — return current user from token
  - POST /change-password — verify old, set new
- [ ] 6. Create `app/services/user.py`
  - CRUD operations (create, get_by_id, get_by_username, list, update, deactivate)
- [ ] 7. Create `app/routers/users.py`
  - All endpoints require admin role
  - Create user with hashed password
  - Prevent deleting self
  - Prevent demoting last admin

## JWT Cookie Config
```python
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=False,  # True in production
    samesite="lax",
    max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    path="/",
)
```

## Success Criteria
- Login returns httpOnly cookie
- Protected endpoints reject unauthenticated requests
- Admin can CRUD users
- Users can only view/change own profile
- Password properly hashed with bcrypt
