---
phase: 3
title: "Frontend: Admin Group Management"
status: pending
priority: P2
effort: 1h
---

# Phase 3: Admin Group Management UI

## Context Links
- Admin panel: `src/components/admin/admin-panel.tsx` (has sub-tabs: Users, Permissions, History)
- Job groups hook: `src/hooks/use-job-groups.ts` (from Phase 2)

## Overview

Add a "Job Groups" sub-tab to AdminPanel for CRUD operations on groups and job assignment.

## Files to Create/Update

### 1. `src/hooks/use-job-groups.ts` -- UPDATE

Add mutation hooks:
```typescript
useCreateGroup()    -> POST /api/job-groups { name, display_order }
useUpdateGroup()    -> PUT /api/job-groups/{id} { name?, display_order? }
useDeleteGroup()    -> DELETE /api/job-groups/{id}
useSetGroupJobs()   -> PUT /api/job-groups/{id}/jobs { job_names: string[] }
```

All mutations invalidate `["job-groups"]` query on success.

### 2. `src/components/admin/group-management.tsx`

Main component for the "Job Groups" admin sub-tab.

Layout:
- "Create Group" button top-right -> opens inline form (name input + submit)
- Table/list of existing groups:
  - Columns: Name | Order | Job Count | Actions (Edit, Delete)
  - Click group row -> expands to show job assignment UI

Job assignment UI (expanded row or dialog):
- Left: list of all available jobs (from `useJobs()`)
- Right: jobs assigned to this group
- Toggle buttons or checkboxes to add/remove jobs
- Save button calls `useSetGroupJobs`

### 3. `src/components/admin/admin-panel.tsx` -- UPDATE

Add to TABS array:
```typescript
{ id: "groups", label: "Job Groups", icon: LayoutGrid }
```

Import `LayoutGrid` from lucide-react.
Import and render `<GroupManagement />` when `activeTab === "groups"`.

## Implementation Steps

1. Add mutation hooks to `use-job-groups.ts`
2. Create `group-management.tsx` component
3. Add "Job Groups" tab to `admin-panel.tsx`
4. Test full CRUD flow

## Todo

- [ ] Add mutation hooks (create, update, delete, setJobs)
- [ ] Create group-management.tsx
- [ ] Update admin-panel.tsx with new tab
- [ ] Test create/edit/delete group
- [ ] Test assign/unassign jobs to groups

## Success Criteria

- Admin can create, rename, reorder, delete groups
- Admin can assign/unassign jobs to groups via UI
- Changes reflect immediately in the Jobs tab group tabs
- Non-admin users cannot access group management
- Deleting a group removes it from tab bar
