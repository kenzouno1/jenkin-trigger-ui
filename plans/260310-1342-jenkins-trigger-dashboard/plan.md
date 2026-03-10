---
title: "Jenkins Build Trigger Dashboard"
description: "Next.js dashboard to manage Jenkins build triggers via webhook with real-time monitoring"
status: pending
priority: P1
effort: 12h
branch: main
tags: [nextjs, jenkins, dashboard, devops]
created: 2026-03-10
---

# Jenkins Build Trigger Dashboard — Implementation Plan

## Overview
Internal tool to trigger Jenkins builds with parameterized inputs (Swagger-like UI), monitor build progress with console streaming, and view dashboard stats. Next.js API routes proxy all Jenkins calls to keep credentials server-side.

## Architecture
- **Frontend:** React 19 + TanStack Query (polling) + shadcn/ui
- **Backend:** Next.js 15 API routes as Jenkins proxy
- **State:** No DB; Jenkins is source of truth; favorites in localStorage
- **Auth:** Jenkins API token via Basic Auth (server-side only)

## Phases

| # | Phase | Est. | Status |
|---|-------|------|--------|
| 1 | [Project Setup](phase-01-project-setup.md) | 1.5h | pending |
| 2 | [Jenkins API Layer](phase-02-jenkins-api-layer.md) | 3h | pending |
| 3 | [Job List & Dashboard](phase-03-job-list-and-dashboard.md) | 3h | pending |
| 4 | [Trigger Modal](phase-04-trigger-modal.md) | 2.5h | pending |
| 5 | [Build Monitor](phase-05-build-monitor.md) | 2h | pending |

## Key Dependencies
- Phase 2 blocks 3, 4, 5 (API layer needed first)
- Phase 3 can run in parallel with 4 after phase 2
- Phase 5 depends on 4 (trigger creates builds to monitor)

## Key References
- Design: `docs/design-guidelines.md`
- Wireframe: `docs/wireframes/index.html`
- Tech stack: `docs/tech-stack.md`

## Environment Variables
```
JENKINS_URL=https://jenkins.ecrm.vn
JENKINS_USER=<username>
JENKINS_API_TOKEN=<api-token>
```
