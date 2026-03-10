# Phase 5: Build Monitor

## Context
- [Plan overview](plan.md) | [Phase 4](phase-04-trigger-modal.md)
- [Wireframe](../../docs/wireframes/index.html) — Build Monitor tab (lines 469-611)
- [Design Guidelines](../../docs/design-guidelines.md) — Build Console section

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Real-time build monitoring with status polling, progress visualization, console output streaming, and build queue display.

## Key Insights
- Wireframe monitor tab: running builds list (left), selected build detail (right: progress + console + queue)
- Console output uses progressive text API with offset tracking — poll every 2s while building
- Build status poll: every 5s while building, stop when `building === false`
- Progress bar: `estimatedDuration` vs elapsed time gives approximate percentage
- Build queue shows items waiting for executors

## Requirements
### Functional
- List of currently running/recent builds with status
- Select a build to view detailed status + console output
- Console output streams progressively (auto-scroll, pin-to-bottom toggle)
- Progress bar based on estimated vs elapsed duration
- Build queue section showing queued items
- Auto-navigate to monitor when build is triggered from modal

### Non-Functional
- Console output polling: every 2s while `hasMore === true`
- Build status polling: every 5s while `building === true`
- Console renders with monospace font, line numbers, colored output
- Smooth auto-scroll without jarring jumps

## Related Code Files
### Create
- `src/hooks/use-build-status.ts` — TanStack Query hook for build status polling
- `src/hooks/use-console-output.ts` — TanStack Query hook for progressive console output
- `src/components/build-monitor.tsx` — Monitor tab container
- `src/components/build-list.tsx` — List of running/recent builds (sidebar)
- `src/components/build-detail.tsx` — Selected build info + progress
- `src/components/build-progress.tsx` — Progress bar with time estimate
- `src/components/console-output.tsx` — Console output viewer
- `src/components/build-queue.tsx` — Queued builds list

## Implementation Steps

### 1. Create use-build-status hook
```tsx
export function useBuildStatus(jobName: string | null, buildNumber: number | null) {
  return useQuery({
    queryKey: ['jenkins', 'build', jobName, buildNumber],
    queryFn: () => fetch(`/api/jenkins/builds/${jobName}/${buildNumber}`).then(r => r.json()),
    enabled: !!jobName && !!buildNumber,
    refetchInterval: (query) => {
      // Poll every 5s while building, stop when done
      return query.state.data?.build?.building ? 5000 : false;
    },
  });
}
```

### 2. Create use-console-output hook
Progressive text fetching with offset tracking:
```tsx
export function useConsoleOutput(jobName: string | null, buildNumber: number | null) {
  const [lines, setLines] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useQuery({
    queryKey: ['jenkins', 'console', jobName, buildNumber, offset],
    queryFn: async () => {
      const res = await fetch(
        `/api/jenkins/builds/${jobName}/${buildNumber}/console?start=${offset}`
      );
      return res.json();
    },
    enabled: !!jobName && !!buildNumber && hasMore,
    refetchInterval: hasMore ? 2000 : false,
    onSuccess: (data) => {
      if (data.text) {
        setLines(prev => [...prev, ...data.text.split('\n').filter(Boolean)]);
        setOffset(data.offset);
      }
      setHasMore(data.hasMore);
    },
  });

  return { lines, hasMore, reset: () => { setLines([]); setOffset(0); setHasMore(true); } };
}
```
Note: Adapt to TanStack Query v5 API (no onSuccess in useQuery — use useEffect on data changes instead).

### 3. Create console-output.tsx
Matches wireframe console design:
- Dark bg (#0a0a0a), mono font (JetBrains Mono 13px), green-tinted text
- Line numbers: muted color, right-aligned, 8-char gutter
- Colored output lines: `[Pipeline]` in blue, success in green, warnings in yellow, errors in red
- Header: "Console Output" title + "Pin to bottom" toggle + "Clear" button
- Auto-scroll behavior:
  - Default: pinned to bottom (auto-scroll as new lines appear)
  - User scrolls up: unpin (stop auto-scrolling)
  - Click "Pin to bottom" to re-enable
- Use `useRef` for scroll container, `scrollIntoView` for auto-scroll

**Line color detection (simple heuristic):**
```tsx
function getLineColor(line: string): string {
  if (line.includes('[Pipeline]') || line.includes('stage')) return 'text-blue-400';
  if (line.includes('SUCCESS') || line.includes('completed successfully')) return 'text-green-400';
  if (line.includes('WARNING') || line.includes('Warning')) return 'text-yellow-400';
  if (line.includes('ERROR') || line.includes('FAILURE')) return 'text-red-400';
  return 'text-zinc-400';
}
```

### 4. Create build-progress.tsx
- Progress bar: blue fill on zinc-800 track
- Percentage calculated: `Math.min(100, (elapsed / estimatedDuration) * 100)`
- Show time: "2m 31s / ~5m 00s estimated"
- Below: build info row — start time, build number, triggered by
- Animated: smooth width transition on progress bar

### 5. Create build-list.tsx
Left sidebar of monitor tab:
- Lists running builds first, then recent completed
- Each item: status dot + job name + build number + duration/time
- Selected item highlighted with accent border
- Click to select and view detail
- Auto-select most recent running build on tab open

### 6. Create build-detail.tsx
Right content area when build selected:
- Header: job name + build number + status badge
- Build progress bar (if running)
- Key info: start time, duration, trigger reason
- Console output component below

### 7. Create build-queue.tsx
Below console output per wireframe:
- "Build Queue" heading
- List of queued items: position number + job name + build number + reason (e.g., "Waiting for executor", "Blocked by X")
- Cancel button per queued item (stretch goal — requires additional API route)

### 8. Create build-monitor.tsx
Container for the monitor tab:
```tsx
// Layout: sidebar (build list) + main (build detail)
// Mobile: stacked (list on top, detail below)
// Desktop: side-by-side (list 280px fixed, detail flex-1)
```
State: `selectedBuild: { jobName: string; buildNumber: number } | null`

### 9. Wire trigger → monitor navigation
After successful build trigger from modal:
- Close modal
- Switch to Monitor tab
- Auto-select the triggered build (need to resolve queue → build number)
- Queue resolution: poll queue item API until `executable.number` appears, then set as selected build

Queue resolution approach:
```typescript
// After trigger returns queueId, poll /queue/item/{id}/api/json
// until response contains executable.number
// Then navigate to monitor with that build number
```
Add API route: `GET /api/jenkins/queue/[id]` → proxies `/queue/item/{id}/api/json`

### 10. Build number tracking state
Maintain a list of "monitored builds" in component state:
```tsx
const [monitoredBuilds, setMonitoredBuilds] = useState<Array<{
  jobName: string;
  buildNumber: number;
}>>([]);
```
Add builds from trigger results + from jobs list (currently running builds).

## Todo
- [ ] Create use-build-status.ts hook
- [ ] Create use-console-output.ts hook (progressive text)
- [ ] Create console-output.tsx with line numbers + coloring
- [ ] Create build-progress.tsx with progress bar
- [ ] Create build-list.tsx (sidebar)
- [ ] Create build-detail.tsx
- [ ] Create build-queue.tsx
- [ ] Create build-monitor.tsx (container)
- [ ] Add queue item API route for queue→build resolution
- [ ] Wire trigger modal → monitor tab navigation
- [ ] Implement auto-scroll with pin-to-bottom toggle
- [ ] Test with live running build
- [ ] Test console output stops polling when build completes

## Success Criteria
- Running builds appear in monitor list with live status
- Console output streams progressively without gaps
- Progress bar updates smoothly based on estimated duration
- Auto-scroll works; user can scroll up without being yanked back
- Pin-to-bottom toggle works correctly
- Build triggered from modal auto-navigates to monitor
- Polling stops when build completes (no unnecessary network requests)

## Risk Assessment
- **Console output volume:** Large builds may produce thousands of lines. Use virtualized list (react-window) if performance degrades. For v1, simple DOM render is fine for <1000 lines.
- **Queue resolution timing:** Queue item may take seconds to assign an executor. Poll every 2s with timeout fallback (show "Waiting for build to start" message).
- **Concurrent builds:** Multiple builds of same job — ensure build number correctly identifies each.

## Security Considerations
- Console output may contain sensitive info (env vars, secrets). No special handling needed since this is an internal tool, but be aware.

## Next Steps
- Post-launch: ANSI color parsing, log search/filter, build comparison, notification sounds
