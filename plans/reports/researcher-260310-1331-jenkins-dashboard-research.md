# Jenkins Dashboard Research Report

**Date:** 2026-03-10 | **Researcher:** Agent Researcher

## Existing Tools & Limitations

### Primary Solutions
1. **Blue Ocean Dashboard** - Modern Jenkins UI with job list, favorites, quick run/re-run. Limitations: Requires plugin installation, minimal parameter control, designed for pipelines not parameterized jobs.
2. **Build Monitor Plugin** - Visible build status display, wall-mounted monitor ideal. Limitations: Status-only view, no build triggering, no parameter UI.
3. **Radiator View Plugin** - Project-grouped status display (green/red boxes). Limitations: Display-only, no parameterization.
4. **Dashboard View Plugin** - Customizable portlets for job selection. Limitations: Old UI, limited parameter visualization.
5. **Build Pipeline Plugin** - Upstream/downstream visualization. Limitations: Pipeline-focused, clunky parameter handling.

### Critical Gap
**No existing Jenkins tool provides a modern, intuitive parameter UI for triggering builds.** Classic Jenkins UI is dated; Blue Ocean skips parameterized builds entirely.

## UX Patterns Worth Adopting

### From Swagger/OpenAPI
- **Dynamic form generation** from schema (parameter types, validation rules)
- **Type-specific inputs**: text, dropdown, file upload, boolean checkbox
- **Conditional field visibility** based on parent parameter values
- **Real-time validation** with helpful error messages
- **Try-it-out pattern**: Live parameter preview before submit

### From Build Monitors
- **Visual job grouping** (by project prefix, team, status)
- **Live status indicators** (green=success, red=failed, yellow=in-progress)
- **Quick-access favorites** for frequently-triggered jobs
- **Large, readable typography** for wall displays and mobile

### From Parameterized Builds
- **Active Choices pattern**: Dropdown options rendered dynamically based on other parameters
- **Sensible defaults** to minimize manual input
- **Security-aware inputs** for credentials/sensitive data (masked fields)
- **Multi-select & file upload** support

## Recommended Dashboard Features

**Core**
- Job list with search/filter by name, tags, team
- Visual status badges (last build result, current state)
- Favorites/starred jobs for quick access
- Responsive design (mobile + desktop + wall-display modes)

**Parameter UI (Key Differentiator)**
- **Swagger-like dynamic form generation** from Jenkins job parameter definitions
- Type detection: string, choice, file, boolean, number
- Conditional visibility (show field X only if field Y = value Z)
- Real-time validation with inline error feedback
- Parameter history (recent values for quick re-runs)
- "Use previous build's parameters" quick-select
- Rich input types: date pickers, code editors, JSON validators

**Build Execution**
- One-click trigger with sensible defaults
- Build queue visualization (current/pending builds)
- Live build progress & log tail
- Re-run failed build with original parameters
- Build result notifications

## Key Differentiators vs. Existing Tools

1. **Modern parameter UI** - Swagger-like form generation, not raw text inputs. Unmatched in Jenkins ecosystem.
2. **Dynamic parameter support** - Active Choices-style cascading parameters with real-time option updates.
3. **Parameterized job focus** - While Blue Ocean ignores parameterized builds, this tool treats them as first-class.
4. **Flexible display modes** - Same app works as mobile dashboard, desktop portal, or wall monitor.
5. **Parameter intelligence** - Remember frequently-used values, suggest defaults, validate before submit.
6. **Open-source webhook/CLI-friendly** - Designed to integrate with external systems (not locked to Jenkins UI).

## Architecture Recommendations

- **Backend**: Consume Jenkins API to extract job metadata + parameter definitions (JSON schema)
- **Frontend**: React/Vue with dynamic form library (react-hook-form + Zod schema validation)
- **Parameter source**: Parse Jenkins parameter XML or query via REST API `/job/{name}/api/json?tree=actions[parameters[*]]`
- **State management**: Real-time job status via WebSocket or polling `/queue/api/json`
- **Auth**: Leverage Jenkins OAuth/LDAP or API tokens

## Unresolved Questions
- Should parameter definitions use Jenkins metadata or custom JSON schema imports?
- How to handle credential-type parameters securely in web UI?
- Target user: DevOps teams, individual devs, or both?
- Wall-display auto-refresh frequency to avoid excessive API calls?

---

## Sources
- [Blue Ocean Dashboard](https://plugins.jenkins.io/blueocean-dashboard/)
- [Blue Ocean Getting Started](https://www.jenkins.io/doc/book/blueocean/getting-started/)
- [Build Monitor Plugin](https://plugins.jenkins.io/build-monitor-plugin)
- [Radiator View Plugin](https://plugins.jenkins.io/radiatorviewplugin)
- [Dashboard View Plugin](https://plugins.jenkins.io/dashboard-view/)
- [Swagger Parameter Docs](https://swagger.io/docs/specification/v2_0/describing-parameters/)
- [Jenkins Parameterized Builds Guide](https://www.baeldung.com/ops/jenkins-parameterized-builds)
- [Dynamic Parameter Rendering](https://www.infracloud.io/blogs/render-jenkins-build-parameters-dynamically/)
- [Jenkins Build Parameters Types](https://codefresh.io/learn/jenkins/7-types-of-jenkins-build-parameters-with-examples/)
