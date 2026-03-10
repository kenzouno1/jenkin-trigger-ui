# Phase 1: Project Setup

## Context
- [Design Guidelines](../../docs/design-guidelines.md)
- [Tech Stack](../../docs/tech-stack.md)

## Overview
- **Priority:** P1 (blocks all other phases)
- **Status:** pending
- **Description:** Initialize Next.js 15 project, install dependencies, configure Tailwind 4, shadcn/ui, fonts, dark theme, and environment variables.

## Key Insights
- Tailwind CSS 4 uses CSS-based config (no tailwind.config.js) — uses `@theme` directive
- shadcn/ui needs initialization via `npx shadcn@latest init`
- Fonts: JetBrains Mono + IBM Plex Sans from Google Fonts (next/font or @import)

## Requirements
### Functional
- Next.js 15 app with App Router and TypeScript
- Dark OLED theme matching design guidelines
- All shadcn/ui components use dark theme overrides
- Google Fonts configured (JetBrains Mono, IBM Plex Sans)

### Non-Functional
- pnpm as package manager
- ESLint configured
- `.env.local` template for Jenkins credentials

## Related Code Files
### Create
- `src/app/layout.tsx` — Root layout with fonts, providers, metadata
- `src/app/page.tsx` — Main dashboard page (placeholder)
- `src/app/globals.css` — Tailwind 4 imports + CSS variables + dark theme
- `src/lib/utils.ts` — cn() utility (shadcn standard)
- `src/components/providers.tsx` — TanStack Query provider wrapper
- `.env.local` — Jenkins environment variables (gitignored)
- `.env.example` — Template for env vars

## Implementation Steps

### 1. Initialize Next.js project
```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

### 2. Install dependencies
```bash
pnpm add @tanstack/react-query@5 zod lucide-react
pnpm add -D @types/node
```

### 3. Initialize shadcn/ui
```bash
pnpm dlx shadcn@latest init
```
Select: New York style, zinc base color, CSS variables = yes

### 4. Install required shadcn components
```bash
pnpm dlx shadcn@latest add button input select dialog badge card tabs checkbox label separator scroll-area skeleton tooltip
```

### 5. Configure Google Fonts in layout.tsx
Use `next/font/google` for JetBrains_Mono and IBM_Plex_Sans. Apply font CSS variables to html element. Map to Tailwind via CSS:
```css
@theme {
  --font-sans: 'IBM Plex Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 6. Configure dark theme CSS variables
In `globals.css`, set shadcn CSS variables per design guidelines:
```css
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 9.8%;
  --card-foreground: 0 0% 98%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 17%;
  --destructive: 0 84% 60%;
  --muted: 240 5% 26%;
  --muted-foreground: 240 5% 64%;
  --accent: 240 5% 17%;
  --border: 240 5% 17%;
  --ring: 217 91% 60%;
  --radius: 0.5rem;
}
```

### 7. Create TanStack Query provider
```tsx
// src/components/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### 8. Create root layout
Wrap children with Providers. Apply fonts, metadata title "JenkinsTrigger", dark bg.

### 9. Create env files
`.env.example`:
```
JENKINS_URL=https://jenkins.ecrm.vn
JENKINS_USER=
JENKINS_API_TOKEN=
```
`.env.local` — copy from example, add to `.gitignore`.

### 10. Add custom scrollbar styles
From wireframe: thin 6px scrollbar, zinc-800 track, zinc-600 thumb.

### 11. Add status color utilities
Define CSS classes for status badges: success, failed, running, queued, aborted, unstable, disabled per design guidelines status colors table.

## Todo
- [ ] Init Next.js project with pnpm
- [ ] Install runtime deps (tanstack-query, zod, lucide-react)
- [ ] Init shadcn/ui + install components
- [ ] Configure fonts (JetBrains Mono + IBM Plex Sans)
- [ ] Set up dark theme CSS variables
- [ ] Create Providers component (TanStack Query)
- [ ] Create root layout.tsx
- [ ] Create placeholder page.tsx
- [ ] Create .env.example + .env.local
- [ ] Add custom scrollbar + status color CSS
- [ ] Verify dev server runs without errors

## Success Criteria
- `pnpm dev` starts without errors
- Dark theme renders correctly
- Fonts load (JetBrains Mono for headings, IBM Plex Sans for body)
- shadcn/ui Button component renders correctly
- TanStack Query devtools accessible (optional)

## Risk Assessment
- **Tailwind 4 breaking changes:** CSS-based config differs from v3; follow latest docs
- **shadcn/ui compatibility:** Ensure latest shadcn CLI supports Tailwind 4

## Next Steps
- Phase 2: Jenkins API Layer (depends on this phase completing)
