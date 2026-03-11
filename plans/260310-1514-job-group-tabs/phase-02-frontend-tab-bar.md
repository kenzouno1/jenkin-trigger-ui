---
phase: 2
title: "Frontend: Hook + Tab Bar Component"
status: pending
priority: P1
effort: 1.5h
---

# Phase 2: Frontend Hook + Job Group Tab Bar

## Context Links
- Job list: `src/components/job-list.tsx`
- Jobs hook: `src/hooks/use-jobs.ts`
- Main page: `src/app/page.tsx` (Jobs tab renders `<JobList>`)
- Types: `src/lib/jenkins-types.ts`
- Design: dark theme, blue accent, shadcn/ui, Lucide icons

## Overview

Create a TanStack Query hook for job groups, a tab bar component, and wire it into the Jobs tab to filter jobs by selected group.

## Files to Create

### 1. `src/hooks/use-job-groups.ts`

```typescript
// Queries
useJobGroups() -> useQuery<JobGroup[]> fetching GET /api/job-groups
  - queryKey: ["job-groups"]
  - Returns array of { id, name, display_order, job_names: string[] }

// Types (inline or in jenkins-types.ts)
interface JobGroup {
  id: string;
  name: string;
  display_order: number;
  job_names: string[];
}
```

No mutation hooks here -- those go in Phase 3 (admin).

### 2. `src/components/job-group-tabs.tsx`

Tab bar component:
- Props: `{ selectedGroup: string | null, onSelectGroup: (id: string | null) => void, isAdmin?: boolean }`
- Renders horizontal scrollable tab bar
- First tab always "All" (selectedGroup = null)
- Then one tab per group, ordered by display_order
- If `isAdmin`, show "+" button at end (emits an event or opens inline input)
- Active tab uses blue underline (same style as main page tabs)
- Uses `useJobGroups()` internally

Visual spec:
```
[ All ] [ BAHADI ] [ BDS ] [ Chatwoot ] [ DEV-Pipelines ] [ + ]
  ^blue underline on active
```

Styling: match existing tab pattern from `page.tsx` lines 133-153.

### 3. `src/components/job-list.tsx` -- UPDATE

Changes:
- Add state: `const [selectedGroup, setSelectedGroup] = useState<string | null>(null)`
- Import and render `<JobGroupTabs>` above search bar
- Import `useJobGroups` to get group data
- In `filtered` useMemo, add group filter:
  - If `selectedGroup` is null -> show all (existing behavior)
  - If `selectedGroup` is set -> find group, filter jobs where `job.name` is in `group.job_names`

### 4. `src/lib/jenkins-types.ts` -- UPDATE

Add JobGroup type:
```typescript
export interface JobGroup {
  id: string;
  name: string;
  display_order: number;
  job_names: string[];
}
```

## Implementation Steps

1. Add `JobGroup` type to `jenkins-types.ts`
2. Create `use-job-groups.ts` hook
3. Create `job-group-tabs.tsx` component
4. Update `job-list.tsx` to integrate tab bar and group filtering

## Todo

- [ ] Add JobGroup type to jenkins-types.ts
- [ ] Create use-job-groups.ts
- [ ] Create job-group-tabs.tsx
- [ ] Update job-list.tsx with group filter logic
- [ ] Verify tab switching filters correctly

## Success Criteria

- Tab bar renders with "All" + all defined groups
- Clicking a group tab filters job list to only that group's jobs
- "All" tab shows all jobs (default)
- Tab bar scrolls horizontally if many groups
- Visual style matches existing tabs
