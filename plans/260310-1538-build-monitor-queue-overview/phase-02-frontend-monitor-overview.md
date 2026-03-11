# Phase 2: Frontend - Monitor Overview with Queue & Running Builds

## Priority: High | Status: Pending | Depends on: Phase 1

## Overview
Replace empty Build Monitor tab with overview showing queue items + running builds. Click to drill into detail view (existing BuildMonitor component).

## Architecture
```
MonitorTab (page.tsx)
├── selectedBuild? → BuildMonitor (existing) + Back button
└── no selection → BuildMonitorOverview (new)
    ├── Queue section (items waiting)
    ├── Running section (active builds)
    └── Each item clickable → sets selectedBuild
```

## Implementation Steps

### 1. Add hooks in `use-jobs.ts`
```typescript
export function useQueue() {
  return useQuery({ queryKey: ["jenkins-queue"], ... refetchInterval: 10_000 })
}

export function useRunningBuilds() {
  return useQuery({ queryKey: ["jenkins-running"], ... refetchInterval: 10_000 })
}
```

### 2. Create `src/components/build-monitor-overview.tsx`
- Fetch queue + running builds
- Queue section: list items with job name, why queued, time waiting
- Running section: list items with job name, build #, progress bar, duration
- Click handler: `onSelectBuild(name, number)`
- Empty state when nothing queued/running

### 3. Update `src/app/page.tsx` Monitor tab
- Replace current monitor tab content:
  - If `monitoredBuild` selected → show BuildMonitor + back button
  - Else → show BuildMonitorOverview
- Back button: `setMonitoredBuild(null)` to return to overview

### 4. Add types to `jenkins-types.ts`
```typescript
export interface JenkinsQueueItem {
  id: number
  task: { name: string; url: string; color: string }
  why: string
  inQueueSince: number
  stuck: boolean
  blocked: boolean
}
```

## Files to Create
- `src/components/build-monitor-overview.tsx`

## Files to Modify
- `src/hooks/use-jobs.ts` — add `useQueue`, `useRunningBuilds`
- `src/lib/jenkins-types.ts` — add `JenkinsQueueItem`, `JenkinsRunningBuild`
- `src/app/page.tsx` — update monitor tab rendering

## Success Criteria
- Monitor tab shows queue + running builds overview by default
- Click item → drill into BuildMonitor detail
- Back button returns to overview
- Auto-refreshes every 10s
