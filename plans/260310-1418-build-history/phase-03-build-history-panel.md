# Phase 3: BuildHistoryPanel Component

## Overview
- **Priority:** High
- **Status:** DONE
- New component showing build history table in a Dialog

## Implementation Steps

1. Create `src/components/build-history-panel.tsx`
   - Props: `{ jobName: string; open: boolean; onClose: () => void; onSelectBuild: (name: string, number: number) => void }`
   - Use Dialog from shadcn/ui
   - Table columns: Build # | Status | Duration | When
   - Reuse `StatusBadge` for status column
   - Reuse `formatDuration` and `timeAgo` helpers (extract to `src/lib/format-utils.ts`)
   - Loading skeleton while fetching
   - Click row → calls `onSelectBuild(jobName, buildNumber)`

2. Extract shared formatters from `recent-builds-table.tsx` to `src/lib/format-utils.ts`
   - `formatDuration(ms)`
   - `timeAgo(timestamp)`

## Related Files
- Create: `src/components/build-history-panel.tsx`
- Create: `src/lib/format-utils.ts`
- Modify: `src/components/recent-builds-table.tsx` (import shared formatters)

## Design
- Follow design-guidelines.md: Dialog pattern (centered, max-w-640, overlay)
- Dark theme, zinc palette, mono font for build numbers
- Status colors per design-guidelines status table

## Success Criteria
- Dialog shows build history for selected job
- Each row shows build#, status badge, duration, relative time
- Clicking row triggers onSelectBuild callback
- Loading/empty states handled
