# Phase 3: Job List & Dashboard

## Context
- [Plan overview](plan.md) | [Phase 2](phase-02-jenkins-api-layer.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [Wireframe](../../docs/wireframes/index.html) — Dashboard tab + Jobs tab

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Build the Dashboard tab (stats, favorites, recent builds) and Jobs tab (searchable/filterable job list with cards).

## Key Insights
- Wireframe has 3 tabs: Dashboard, Jobs, Build Monitor
- Dashboard shows: 4 stat cards, favorites grid, recent builds table
- Jobs tab: search bar + filter dropdown + grid of job cards
- Favorites stored in localStorage (array of job names)
- Status badge component reused across multiple views

## Requirements
### Functional
- Tab navigation: Dashboard / Jobs / Build Monitor
- Dashboard: stats overview (total jobs, running, failed, success rate), quick-trigger favorites, recent builds table
- Jobs: searchable list, filterable by status, job cards with trigger button
- Favorites: add/remove via star icon, persist in localStorage

### Non-Functional
- TanStack Query for data fetching with 30s stale time
- Loading skeletons per design guidelines
- Responsive: 1-col mobile, 2-col tablet, 3-col desktop

## Related Code Files
### Create
- `src/hooks/use-jobs.ts` — TanStack Query hook for job list
- `src/hooks/use-favorites.ts` — localStorage favorites hook
- `src/components/tab-navigation.tsx` — Dashboard/Jobs/Monitor tabs
- `src/components/dashboard-stats.tsx` — 4 stat cards
- `src/components/favorites-grid.tsx` — Quick-trigger favorites section
- `src/components/recent-builds-table.tsx` — Recent builds table
- `src/components/job-list.tsx` — Searchable job grid
- `src/components/job-card.tsx` — Individual job card
- `src/components/search-filter.tsx` — Search input + status filter
- `src/components/status-badge.tsx` — Reusable status badge (used everywhere)
### Modify
- `src/app/page.tsx` — Compose all dashboard/job components

## Implementation Steps

### 1. Create status-badge.tsx
Reusable component matching wireframe status pills:
```tsx
interface StatusBadgeProps { status: JenkinsJobStatus }
```
- Pill shape, uppercase 11px, colored bg+text per design guidelines status table
- Animated pulse dot for 'running' status
- Min-width 72px for alignment

### 2. Create use-jobs hook
```tsx
export function useJobs() {
  return useQuery({
    queryKey: ['jenkins', 'jobs'],
    queryFn: () => fetch('/api/jenkins/jobs').then(r => r.json()),
    staleTime: 30_000,
    refetchInterval: 30_000, // Auto-refresh every 30s
  });
}
```

### 3. Create use-favorites hook
```tsx
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('jenkins-favorites') || '[]');
  });
  // toggleFavorite(name), isFavorite(name)
  // Sync to localStorage on change
}
```

### 4. Create tab-navigation.tsx
- Three tabs: Dashboard, Jobs, Build Monitor
- Styled per wireframe: zinc-400 text, blue-500 active with bottom border indicator
- Use URL hash or state to track active tab
- Render child panels conditionally

### 5. Create dashboard-stats.tsx
- 4 cards in a row: Total Jobs, Running, Failed (24h), Success Rate
- Icon (Lucide) + large number + label
- Compute from jobs data: count by status, calculate success rate
- Skeleton loading state

### 6. Create favorites-grid.tsx
- Show jobs marked as favorites (from localStorage)
- Each row: status dot + job name + last build info + trigger button (hover reveal)
- "No favorites" empty state with guidance text

### 7. Create recent-builds-table.tsx
- Table: Job, Build #, Status, Duration, Timestamp
- Pull from jobs data (lastBuild info) — sort by most recent
- Status badge in status column
- Clickable rows to navigate to build monitor

### 8. Create search-filter.tsx
- Search input with magnifying glass icon
- Status dropdown filter: All, Success, Failed, Running, Unstable, Disabled
- Filter jobs client-side (already loaded via TanStack Query)

### 9. Create job-card.tsx
```tsx
interface JobCardProps {
  job: JenkinsJob;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onTrigger: () => void;
}
```
- Surface bg, border, rounded-lg
- Left: status dot (8px) + job name (semibold) + description (muted, truncated)
- Below: last build number + timestamp (muted text)
- Right: star icon (toggle favorite) + trigger button (accent blue)
- Hover: bg-elevated transition

### 10. Create job-list.tsx
- Grid layout: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`
- Maps filtered jobs to JobCard components
- Empty state when no jobs match search/filter
- Loading: grid of skeleton cards

### 11. Compose page.tsx
```tsx
export default function Home() {
  return (
    <main>
      <Header /> {/* JenkinsTrigger logo + optional settings */}
      <TabNavigation>
        <DashboardPanel />  {/* stats + favorites + recent builds */}
        <JobsPanel />       {/* search + filter + job grid */}
        <MonitorPanel />    {/* Phase 5 */}
      </TabNavigation>
    </main>
  );
}
```

### 12. Create header component
- Match wireframe: "Jenkins" + "Trigger" (blue) in JetBrains Mono
- Right side: connection status indicator (green dot when Jenkins reachable)
- Optional: settings gear icon for future config

## Todo
- [ ] Create status-badge.tsx
- [ ] Create use-jobs.ts hook
- [ ] Create use-favorites.ts hook
- [ ] Create tab-navigation.tsx
- [ ] Create dashboard-stats.tsx
- [ ] Create favorites-grid.tsx
- [ ] Create recent-builds-table.tsx
- [ ] Create search-filter.tsx
- [ ] Create job-card.tsx
- [ ] Create job-list.tsx
- [ ] Create header component
- [ ] Compose page.tsx with all components
- [ ] Add loading skeletons
- [ ] Test responsive layout (mobile/tablet/desktop)

## Success Criteria
- Dashboard shows live job stats from Jenkins
- Job list renders all jobs with correct statuses
- Search filters jobs by name in real-time
- Status filter narrows jobs by build status
- Favorites persist across page reloads
- Loading states show skeletons (no layout shift)
- Responsive layout matches wireframe breakpoints

## Risk Assessment
- **Large job count:** If Jenkins has 100+ jobs, list could be slow. TanStack Query caching + pagination mitigates. For v1, load all at once — paginate if needed later.
- **Stale status data:** 30s polling is reasonable; build-in-progress status may lag briefly.

## Next Steps
- Phase 4: Trigger Modal (opens from job card trigger button)
