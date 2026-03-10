# Tech Stack

## Core Framework
- **Next.js 15** (App Router) — SSR, API routes as Jenkins proxy
- **TypeScript** — Type safety for Jenkins API responses
- **React 19** — UI rendering

## UI
- **Tailwind CSS 4** — Utility-first styling
- **shadcn/ui** — Accessible, composable components (Radix UI primitives)
- **Lucide React** — Icons

## Data & State
- **TanStack Query v5** — Server state, polling, caching for build status
- **Zod** — Runtime validation of Jenkins API responses and form params

## Backend (Next.js API Routes)
- Proxy all Jenkins API calls (avoid CORS, secure credentials)
- Jenkins credentials stored server-side via env vars
- No database needed — Jenkins is the source of truth

## Dev Tools
- **ESLint** + **Prettier** — Code quality
- **pnpm** — Package manager

## Architecture Decisions
- **No separate backend** — Next.js API routes sufficient for proxying
- **No database** — Jenkins is the single source of truth
- **Polling over WebSocket** — Jenkins API doesn't support WS; TanStack Query polling is simpler
- **Server-side credentials** — Jenkins API token never exposed to browser
