# Phase 1: Enrich Builds API Endpoint

## Overview
- **Priority:** High
- **Status:** DONE
- Modify `/api/jenkins/jobs/[name]/builds` to return full build info instead of just refs

## Context
- Current: returns `{ number, url }[]` from `getJobDetail()`
- Need: `{ number, url, result, building, timestamp, duration }[]`

## Implementation Steps

1. Add `getBuildsHistory(name, limit)` to `jenkins-client.ts`
   - Call Jenkins API: `/job/{name}/api/json?tree=builds[number,url,result,building,timestamp,duration,displayName]{0,20}`
   - Jenkins tree query supports range `{0,20}` for pagination
   - Return typed `JenkinsBuildInfo[]`

2. Update `src/app/api/jenkins/jobs/[name]/builds/route.ts`
   - Use new `getBuildsHistory()` instead of `getJobDetail()`
   - Accept optional `?limit=N` query param (default 20)

## Related Files
- Modify: `src/lib/jenkins-client.ts`
- Modify: `src/app/api/jenkins/jobs/[name]/builds/route.ts`

## Success Criteria
- API returns array of builds with status, duration, timestamp
- Limited to 20 builds by default
- Single Jenkins API call (no N+1)
