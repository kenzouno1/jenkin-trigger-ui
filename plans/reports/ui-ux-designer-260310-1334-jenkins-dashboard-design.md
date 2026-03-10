# Design Report: Jenkins Build Trigger Dashboard

**Date:** 2026-03-10 | **Agent:** ui-ux-designer

## Deliverables

| File | Path | Description |
|------|------|-------------|
| Design Guidelines | `docs/design-guidelines.md` | Color, typography, spacing, components (168 lines) |
| Wireframe | `docs/wireframes/index.html` | Full interactive wireframe, 3 views + trigger modal |

## Design Decisions

### Theme & Direction
- **Dark OLED theme** (bg `#09090b`) — reduces eye strain for DevOps engineers, matches CI/CD tooling conventions (Grafana, Datadog, GitHub Actions)
- **Data-dense layout** — prioritize information density over whitespace; engineers want to see everything at a glance
- **Desktop-first** — primary use case is desktop monitors in dev/ops environments

### Typography
- **JetBrains Mono** (headings + code) — developer-native font, strong technical authority, NOT Inter/Poppins as requested
- **IBM Plex Sans** (body/UI) — clean technical readability, pairs naturally with JetBrains Mono, designed for information-dense interfaces
- Both support Vietnamese characters

### Color System
- **7 distinct status colors** — Success (green), Failed (red), Running (blue), Queued (gray), Aborted (orange), Unstable (yellow), Disabled (dim zinc)
- Status conveyed via color + text + dot icon (never color alone, WCAG compliant)
- Blue accent (#3b82f6) for primary actions — neutral, professional, not affiliated with any specific brand

### Component Patterns
- **Job cards** — horizontal layout with status dot, name, metadata, action button. Hover reveals trigger button on favorites
- **Status badges** — pill-shaped with tinted background + colored text + dot prefix. Pulsing dot for "running" state
- **Trigger modal (Swagger-inspired)** — each parameter displayed in bordered card with: mono name, type badge (color-coded by type), description, input field, default value. Types covered: string, choice, boolean, password, file
- **Console output** — terminal-style dark bg, line numbers, color-coded output (blue=stages, green=success, yellow=warnings, red=errors)
- **Build stages** — horizontal pill chain showing pipeline progress (checkmark=done, pulse=running, gray=pending)

### Wireframe Structure (Single HTML, 3 tabs)
1. **Dashboard** — stats row (4 cards) + favorites sidebar + recent builds table
2. **Jobs** — search/filter bar + sortable job card list with all status variants
3. **Build Monitor** — active build header with progress bar + stage pills + live console + queue list
4. **Trigger Modal** — overlay with 6 parameter types demonstrated

### Key UX Patterns
- **Favorites** — star-marked jobs for quick-trigger access from dashboard
- **Context-aware buttons** — "Trigger" on idle jobs, "Monitor" on running jobs, "Waiting..." on queued, disabled on disabled jobs
- **Search** — real-time filter on jobs list (functional in wireframe)
- **Auto-scroll console** — checkbox toggle for pinning to bottom during live output
- **Progress estimation** — percentage bar with elapsed vs estimated time

## Technical Notes for Implementation
- shadcn/ui CSS variable overrides provided in guidelines (HSL format, ready for `globals.css`)
- All colors use Tailwind's zinc scale — maps directly to shadcn/ui dark theme
- Status badge component should accept `variant` prop matching Jenkins `result` field values
- Parameter form should be auto-generated from Jenkins job config XML `<parameterDefinitions>`
- Console streaming: use TanStack Query polling with append-only buffer, not full refetch

## Unresolved Questions
- Should the trigger modal support "parameter presets" (saved parameter combinations)?
- Console output ANSI color parsing scope — full ANSI or simplified (stage/success/error only)?
- Should favorites persist in localStorage or require backend storage?
