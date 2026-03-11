---
phase: 5
title: "Next.js Auth Integration"
status: pending
priority: P1
effort: 4h
depends_on: [2]
---

# Phase 5 — Next.js Auth Integration

## Overview
Integrate Next.js frontend with FastAPI auth. Add login page, auth middleware, protected routes, and update API routes to validate auth.

## Implementation Steps

### Login Page
- [ ] 1. Create `src/app/login/page.tsx`
  - Username + password form
  - Call FastAPI POST /api/auth/login
  - On success → redirect to dashboard
  - On error → show error message
  - Clean, minimal design matching existing dark theme

### Auth Context
- [ ] 2. Create `src/hooks/use-auth.ts`
  - `useAuth()` hook — returns { user, isLoading, isAuthenticated, logout }
  - Calls FastAPI GET /api/auth/me on mount
  - Cache with TanStack Query
  - `logout()` → POST /api/auth/logout → redirect to /login

### Next.js Middleware
- [ ] 3. Create `src/middleware.ts`
  - Check for `access_token` cookie on protected routes
  - If no cookie → redirect to /login
  - Allow /login page without auth
  - Allow /api/auth/* without auth
  - Forward cookie to FastAPI for validation

### Update API Routes
- [ ] 4. Update all `src/app/api/jenkins/*` routes
  - Extract `access_token` cookie from request
  - Call FastAPI to validate token + check permissions
  - If invalid → 401
  - If no permission → 403
  - If OK → proceed with Jenkins proxy call

### Header/Layout Updates
- [ ] 5. Update `src/app/layout.tsx` — wrap with auth provider
- [ ] 6. Update `src/app/page.tsx` header
  - Show logged-in username
  - Add logout button
  - Show role badge (admin/user)

### Next.js Config
- [ ] 7. Update `next.config.ts`
  - Add rewrite rule: `/api/auth/*` → `http://localhost:8000/api/auth/*`
  - Or proxy relevant FastAPI routes

## Auth Flow
```
1. User visits / → middleware checks cookie
2. No cookie → redirect to /login
3. User logs in → FastAPI sets httpOnly cookie
4. Redirect to / → middleware sees cookie → allow
5. Page loads → useAuth() calls /api/auth/me → gets user info
6. API routes forward cookie to FastAPI for validation
```

## Environment
- `FASTAPI_URL=http://localhost:8000` (Next.js env var for API route proxying)

## Success Criteria
- Unauthenticated users redirected to login
- Login form works with FastAPI backend
- User info displayed in header
- API routes reject unauthenticated/unauthorized requests
- Logout clears cookie and redirects
