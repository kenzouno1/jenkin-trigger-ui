# Build Monitor - Queue & Running Jobs Overview

## Summary
Redesign Build Monitor tab to show overview of all queued items + running builds. Click item to drill into build details (existing BuildMonitor component).

## Current State
- Build Monitor tab shows single build or empty state
- No queue visibility — users can't see what's waiting
- Jenkins has `/queue/api/json` endpoint for build queue

## Architecture

```
Build Monitor Tab
├── Queue Section (collapsible)
│   └── QueueItem[] → click → show build details when started
├── Running Builds Section
│   └── RunningBuild[] → click → show BuildMonitor detail
└── BuildMonitor Detail (existing, shown on click)
    └── Back button to return to overview
```

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Backend: Queue API endpoint | pending | phase-01-backend-queue-api.md |
| 2 | Frontend: Queue hook + Monitor overview | pending | phase-02-frontend-monitor-overview.md |

## Dependencies
- Phase 2 depends on Phase 1 (needs queue API)

## Risk
- Low complexity. Mostly additive changes (new endpoint + new overview component).
