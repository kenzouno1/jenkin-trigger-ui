# Phase 2: useBuildsHistory Hook

## Overview
- **Priority:** High
- **Status:** DONE
- Create TanStack Query hook for fetching build history

## Implementation Steps

1. Add `useBuildsHistory(jobName)` to `src/hooks/use-jobs.ts`
   - Query key: `["jenkins-builds", jobName]`
   - Fetch: `/api/jenkins/jobs/{name}/builds`
   - Return `JenkinsBuildInfo[]`
   - `enabled: !!jobName`
   - No auto-refetch (manual refresh button instead)

## Related Files
- Modify: `src/hooks/use-jobs.ts`

## Success Criteria
- Hook returns typed build history array
- Only fetches when jobName is provided
