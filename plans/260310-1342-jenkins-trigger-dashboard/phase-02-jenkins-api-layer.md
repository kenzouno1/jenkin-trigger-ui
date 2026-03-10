# Phase 2: Jenkins API Layer

## Context
- [Plan overview](plan.md) | [Phase 1](phase-01-project-setup.md)
- Jenkins URL: `jenkins.ecrm.vn` (env var `JENKINS_URL`)
- Auth: Basic Auth with username + API token

## Overview
- **Priority:** P1 (blocks phases 3-5)
- **Status:** pending
- **Description:** Build server-side Jenkins client, TypeScript types, XML parser for job config, and all Next.js API routes that proxy Jenkins calls.

## Key Insights
- Jenkins config.xml contains `<parameterDefinitions>` with typed params
- Param types: StringParameterDefinition, ChoiceParameterDefinition, BooleanParameterDefinition, PasswordParameterDefinition, FileParameterDefinition
- Build trigger returns 201 with `Location` header containing queue URL
- Queue item resolves to build number after executor picks it up
- Console output uses progressive text with `X-Text-Size` header for offset tracking

## Requirements
### Functional
- Server-side client handles all Jenkins API calls with error handling
- Parse config.xml to extract parameter definitions
- API routes: list jobs, get job details+params, trigger build, build status, console output
- Zod schemas validate Jenkins API responses

### Non-Functional
- Credentials never exposed to client
- Timeout handling for Jenkins API calls (30s default)
- Proper HTTP error propagation with meaningful messages

## Architecture
```
Browser → Next.js API Routes → Jenkins API
                ↓
         jenkins-client.ts (fetch + auth headers)
         jenkins-xml-parser.ts (config.xml → params)
         jenkins-types.ts (TypeScript types + Zod schemas)
```

## Related Code Files
### Create
- `src/lib/jenkins-client.ts` — Server-side HTTP client for Jenkins
- `src/lib/jenkins-types.ts` — Types + Zod schemas
- `src/lib/jenkins-xml-parser.ts` — Parse config.xml parameterDefinitions
- `src/app/api/jenkins/jobs/route.ts` — GET list all jobs
- `src/app/api/jenkins/jobs/[name]/route.ts` — GET job detail + params
- `src/app/api/jenkins/jobs/[name]/build/route.ts` — POST trigger build
- `src/app/api/jenkins/builds/[name]/[number]/route.ts` — GET build status
- `src/app/api/jenkins/builds/[name]/[number]/console/route.ts` — GET console output

## Implementation Steps

### 1. Define TypeScript types (`jenkins-types.ts`)
```typescript
// Core types
export type JenkinsJobStatus = 'success' | 'failed' | 'running' | 'queued' | 'aborted' | 'unstable' | 'disabled' | 'not_built';

export interface JenkinsJob {
  name: string;
  url: string;
  color: string; // Jenkins color codes → map to status
  description: string | null;
  buildable: boolean;
  lastBuild: { number: number; url: string } | null;
  lastSuccessfulBuild: { number: number } | null;
  lastFailedBuild: { number: number } | null;
  inQueue: boolean;
}

export interface JenkinsParam {
  name: string;
  type: 'string' | 'choice' | 'boolean' | 'password' | 'file';
  description: string;
  defaultValue: string | boolean;
  choices?: string[]; // For choice params
  required: boolean;
}

export interface JenkinsBuild {
  number: number;
  result: string | null; // null while running
  building: boolean;
  timestamp: number;
  duration: number;
  estimatedDuration: number;
  displayName: string;
  url: string;
}

export interface ConsoleOutput {
  text: string;
  offset: number;
  hasMore: boolean;
}
```

Create Zod schemas matching these types for runtime validation.

### 2. Map Jenkins color codes to status
```typescript
export function mapColorToStatus(color: string): JenkinsJobStatus {
  const map: Record<string, JenkinsJobStatus> = {
    blue: 'success',
    blue_anime: 'running',
    red: 'failed',
    red_anime: 'running',
    yellow: 'unstable',
    yellow_anime: 'running',
    grey: 'not_built',
    disabled: 'disabled',
    aborted: 'aborted',
    aborted_anime: 'running',
    notbuilt: 'not_built',
    notbuilt_anime: 'running',
  };
  return map[color] ?? 'not_built';
}
```

### 3. Build Jenkins client (`jenkins-client.ts`)
- Read env vars: `JENKINS_URL`, `JENKINS_USER`, `JENKINS_API_TOKEN`
- Validate env vars at module init (throw helpful error if missing)
- Create base fetch wrapper with Basic Auth header, timeout, error handling
- Methods:
  - `getJobs()` — GET `/api/json?tree=jobs[name,url,color,description,buildable,lastBuild[number,url],lastSuccessfulBuild[number],lastFailedBuild[number],inQueue]`
  - `getJobDetail(name: string)` — GET `/job/{name}/api/json`
  - `getJobConfig(name: string)` — GET `/job/{name}/config.xml` (returns XML string)
  - `triggerBuild(name: string, params?: Record<string, string>)` — POST to `/job/{name}/build` or `/job/{name}/buildWithParameters`
  - `getBuildInfo(name: string, number: number)` — GET `/job/{name}/{number}/api/json`
  - `getConsoleOutput(name: string, number: number, start?: number)` — GET `/job/{name}/{number}/logText/progressiveText?start={start}`

**Important implementation details:**
- Use `tree` query param to limit Jenkins API response size
- `triggerBuild` returns queue URL from `Location` header; parse queue item ID
- Console output: response header `X-Text-Size` gives next offset; `X-More-Data: true` means more output coming
- Handle Jenkins folder jobs: name might contain `/` for nested jobs — URL encode properly

### 4. Build XML parser (`jenkins-xml-parser.ts`)
- Use built-in DOMParser (or `fast-xml-parser` npm package since this runs server-side in Node)
- Install: `pnpm add fast-xml-parser`
- Parse `<flow-definition>` or `<project>` root → find `<parameterDefinitions>` section
- Map each `<hudson.model.XxxParameterDefinition>` to `JenkinsParam`:
  - `hudson.model.StringParameterDefinition` → type: 'string'
  - `hudson.model.ChoiceParameterDefinition` → type: 'choice', extract `<choices><a><string>` values
  - `hudson.model.BooleanParameterDefinition` → type: 'boolean'
  - `hudson.model.PasswordParameterDefinition` → type: 'password'
  - `hudson.model.FileParameterDefinition` → type: 'file'
- Extract: `<name>`, `<description>`, `<defaultValue>`, `<choices>`
- Return `JenkinsParam[]`

### 5. Create API routes

**GET `/api/jenkins/jobs`**
- Call `getJobs()`, map colors to statuses, return JSON array
- Response shape: `{ jobs: JenkinsJob[] }`

**GET `/api/jenkins/jobs/[name]`**
- Call `getJobDetail(name)` + `getJobConfig(name)` in parallel
- Parse config XML for params
- Return `{ job: JenkinsJob, params: JenkinsParam[] }`

**POST `/api/jenkins/jobs/[name]/build`**
- Read body as JSON: `{ params: Record<string, string | boolean> }`
- Validate with Zod
- Call `triggerBuild(name, params)`
- Return `{ queueId: number }` (or error)

**GET `/api/jenkins/builds/[name]/[number]`**
- Call `getBuildInfo(name, number)`
- Return `{ build: JenkinsBuild }`

**GET `/api/jenkins/builds/[name]/[number]/console`**
- Read query param `start` (default 0)
- Call `getConsoleOutput(name, number, start)`
- Return `{ text: string, offset: number, hasMore: boolean }`

### 6. Error handling pattern
```typescript
// All routes use consistent error shape
function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
// Wrap Jenkins client calls in try/catch
// Map Jenkins HTTP errors: 401→auth error, 404→job not found, 500→Jenkins error
```

### 7. Handle folder/nested jobs
Jenkins organizes jobs in folders. Job name `folder/job` maps to URL `/job/folder/job/job/jobname/`. For simplicity in v1, support flat job names. If folder support needed later, encode name with `/` → `/job/` segments.

## Todo
- [ ] Install fast-xml-parser
- [ ] Create jenkins-types.ts with types + Zod schemas + color mapper
- [ ] Create jenkins-client.ts with all methods
- [ ] Create jenkins-xml-parser.ts
- [ ] Create API route: GET /api/jenkins/jobs
- [ ] Create API route: GET /api/jenkins/jobs/[name]
- [ ] Create API route: POST /api/jenkins/jobs/[name]/build
- [ ] Create API route: GET /api/jenkins/builds/[name]/[number]
- [ ] Create API route: GET /api/jenkins/builds/[name]/[number]/console
- [ ] Test with actual Jenkins instance (manual curl tests)

## Success Criteria
- All API routes return correct JSON shapes
- XML parser correctly extracts all 5 param types
- Auth errors return 401 with clear message
- Missing env vars throw descriptive error at startup
- No Jenkins credentials leaked in client responses

## Risk Assessment
- **XML parsing edge cases:** Jenkins config.xml varies by job type (freestyle, pipeline, multibranch). Focus on `<parameterDefinitions>` which is consistent across types.
- **CORS:** Not an issue since we proxy through Next.js API routes.
- **Rate limiting:** Jenkins may throttle; add retry logic if needed (defer to phase 5).

## Security Considerations
- Jenkins credentials stored only in env vars, never in client bundles
- API routes don't echo back credentials in responses
- Password param values should be masked in logs

## Next Steps
- Phase 3: Job List & Dashboard (uses GET /api/jenkins/jobs)
- Phase 4: Trigger Modal (uses GET .../[name] + POST .../build)
- Phase 5: Build Monitor (uses GET .../builds/...)
