# Phase 4: Integration

## Overview
- **Priority:** High
- **Status:** DONE
- Wire BuildHistoryPanel into JobCard and page

## Implementation Steps

1. Add "History" button to `JobCard`
   - New prop: `onViewHistory: (name: string) => void`
   - Add History button (Clock icon) next to Trigger button, same hover-reveal style

2. Update `page.tsx`
   - Add `historyJob` state (string | null)
   - Pass `onViewHistory={setHistoryJob}` to JobCard (via JobList)
   - Render `<BuildHistoryPanel>` with onSelectBuild → set monitoredBuild + switch to monitor tab
   - Also add history access from RecentBuildsTable rows (optional)

3. Update `JobList` to pass `onViewHistory` through

## Related Files
- Modify: `src/components/job-card.tsx`
- Modify: `src/components/job-list.tsx`
- Modify: `src/app/page.tsx`

## Success Criteria
- History button visible on job card hover
- Clicking opens BuildHistoryPanel dialog
- Selecting a build from history opens Build Monitor
- Smooth navigation flow: Job → History → Build Monitor
