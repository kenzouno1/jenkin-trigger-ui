---
phase: 6
title: "Admin Panel UI"
status: pending
priority: P1
effort: 4h
depends_on: [3, 4, 5]
---

# Phase 6 — Admin Panel UI

## Overview
Build admin panel in Next.js for managing users, assigning job permissions, and viewing trigger history. Only accessible to admin role.

## New Pages/Components

### Admin Tab (in main page)
- Add "Admin" tab to tab navigation (visible only to admin role)

### User Management Section
- [ ] 1. Create `src/components/admin/user-list.tsx`
  - Table: username, email, role, status, actions
  - Actions: edit, deactivate/activate
  - "Add User" button opens modal
- [ ] 2. Create `src/components/admin/user-form-modal.tsx`
  - Create/edit user form
  - Fields: username, email, password (create only), role dropdown
  - Validation with Zod

### Job Permission Section
- [ ] 3. Create `src/components/admin/job-permissions.tsx`
  - Select user → show job permission matrix
  - Checkbox grid: job name | can view | can trigger
  - Fetch all Jenkins jobs for the matrix
  - Bulk save permissions
- [ ] 4. Create `src/hooks/use-permissions.ts`
  - `useUserPermissions(userId)` — fetch/mutate permissions
  - `useAllJobs()` — fetch all Jenkins jobs (admin view, unfiltered)

### Trigger History Section
- [ ] 5. Create `src/components/admin/trigger-history-table.tsx`
  - Table: timestamp, user, job, parameters, status
  - Filters: user, job name, date range
  - Pagination
- [ ] 6. Create `src/hooks/use-trigger-history.ts`
  - `useTriggerHistory(filters)` — paginated history

### User's Own Trigger History
- [ ] 7. Add "My Triggers" section to dashboard tab
  - Show user's own trigger history (recent 10)
  - Link to full history view

## Implementation Steps

- [ ] 8. Add "Admin" tab to page.tsx (conditional on admin role)
- [ ] 9. Create `src/components/admin/admin-panel.tsx`
  - Sub-tabs: Users | Job Permissions | Trigger History
- [ ] 10. Wire up all API calls to FastAPI endpoints
- [ ] 11. Add loading states and error handling

## Related Code Files
- Modify: `src/app/page.tsx` — add admin tab
- Create: `src/components/admin/` — all admin components
- Create: `src/hooks/use-permissions.ts`, `src/hooks/use-trigger-history.ts`

## Success Criteria
- Admin can create/edit/deactivate users
- Admin can assign job view/trigger permissions per user
- Admin can view all trigger history with filters
- Users can see own trigger history
- Non-admin users cannot see admin tab
- Responsive, matches existing dark theme
