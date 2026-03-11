# Build History Feature

## Overview
Add build history view per job — show list of past builds with status, duration, timestamp; click to view console output in Build Monitor.

## Current State
- `RecentBuildsTable` shows last build per job (dashboard-level, not per-job)
- `BuildMonitor` shows single build console + dropdown of build refs (number+url only)
- API `/api/jenkins/jobs/[name]/builds` returns only `{ number, url }[]` (no status/duration)
- `jenkins-client.ts` has `getBuildInfo()` for single build, `getJobDetail()` returns build refs

## Gap
No dedicated per-job build history view. User can't browse a job's builds with status/duration/time info at a glance.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | API: enrich builds endpoint | DONE | [phase-01](phase-01-api-builds-endpoint.md) |
| 2 | Hook: useBuildsHistory | DONE | [phase-02](phase-02-hook-builds-history.md) |
| 3 | UI: BuildHistoryPanel component | DONE | [phase-03](phase-03-build-history-panel.md) |
| 4 | Integration: wire into page | DONE | [phase-04](phase-04-integration.md) |

## Architecture
```
User clicks "History" on job card
  → Opens BuildHistoryPanel (dialog or inline)
    → useBuildsHistory(jobName) fetches /api/jenkins/jobs/[name]/builds
      → API fetches build refs from Jenkins, then fetches info for each
    → Table: #number | status badge | duration | timestamp
    → Click row → opens BuildMonitor for that build
```

## Key Decisions
- Enrich builds API to return full info (status, duration, timestamp) — avoids N+1 client calls
- Limit to 20 builds server-side for performance
- Reuse existing StatusBadge, BuildMonitor components
- Add "History" button to JobCard (alongside Trigger)
