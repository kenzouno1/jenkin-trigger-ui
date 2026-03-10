# Design Guidelines — Jenkins Build Trigger Dashboard

## Brand Identity
- **Personality:** Professional, technical, reliable, efficient
- **Feel:** DevOps control center — dense data, clear hierarchy, instant status recognition
- **Theme:** Dark-first (OLED-friendly)

## Color Palette

### Base Colors
| Token             | Hex       | Usage                          |
|-------------------|-----------|--------------------------------|
| `--bg-root`       | `#09090b` | Page background (zinc-950)     |
| `--bg-surface`    | `#18181b` | Cards, panels (zinc-900)       |
| `--bg-elevated`   | `#27272a` | Hover states, inputs (zinc-800)|
| `--bg-overlay`    | `#09090bcc`| Modal backdrop                |
| `--border`        | `#27272a` | Default borders (zinc-800)     |
| `--border-focus`  | `#3b82f6` | Focus rings (blue-500)         |
| `--text-primary`  | `#fafafa` | Headings, primary text         |
| `--text-secondary`| `#a1a1aa` | Labels, descriptions (zinc-400)|
| `--text-muted`    | `#71717a` | Timestamps, metadata (zinc-500)|

### Accent Colors
| Token           | Hex       | Usage                    |
|-----------------|-----------|--------------------------|
| `--accent`      | `#3b82f6` | Primary actions (blue-500)|
| `--accent-hover`| `#2563eb` | Button hover (blue-600)  |
| `--accent-muted`| `#1e3a5f` | Subtle highlights        |

### Status Colors (Critical for CI/CD)
| Status    | Badge BG   | Badge Text | Dot/Icon  | Tailwind         |
|-----------|------------|------------|-----------|------------------|
| Success   | `#052e16`  | `#4ade80`  | `#22c55e` | green-500/green-400|
| Failed    | `#450a0a`  | `#f87171`  | `#ef4444` | red-500/red-400  |
| Running   | `#172554`  | `#60a5fa`  | `#3b82f6` | blue-500/blue-400|
| Queued    | `#27272a`  | `#a1a1aa`  | `#71717a` | zinc-500/zinc-400|
| Aborted   | `#431407`  | `#fb923c`  | `#f97316` | orange-500/400   |
| Unstable  | `#422006`  | `#fbbf24`  | `#eab308` | yellow-500/400   |
| Disabled  | `#18181b`  | `#52525b`  | `#3f3f46` | zinc-600/zinc-500|

## Typography

### Font Stack
- **Headings:** `JetBrains Mono` (mono, technical authority)
- **Body/UI:** `IBM Plex Sans` (clean readability, technical feel)
- **Code/Console:** `JetBrains Mono` (native code appearance)
- Google Fonts import includes weights: 300,400,500,600,700

### Type Scale
| Element          | Size    | Weight | Font            | Line Height |
|------------------|---------|--------|-----------------|-------------|
| Page title       | 24px    | 700    | JetBrains Mono  | 1.2         |
| Section heading  | 18px    | 600    | JetBrains Mono  | 1.3         |
| Card title       | 14px    | 600    | IBM Plex Sans   | 1.4         |
| Body text        | 14px    | 400    | IBM Plex Sans   | 1.5         |
| Small/caption    | 12px    | 400    | IBM Plex Sans   | 1.4         |
| Badge/tag        | 11px    | 500    | IBM Plex Sans   | 1.0         |
| Console output   | 13px    | 400    | JetBrains Mono  | 1.6         |

## Spacing System
Base unit: 4px. Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- **Card padding:** 16px (p-4)
- **Section gap:** 24px (gap-6)
- **Page margin:** 24px mobile, 32px desktop
- **Form field gap:** 16px (gap-4)
- **Inline element gap:** 8px (gap-2)

## Border Radius
- **Cards/Panels:** 8px (rounded-lg)
- **Buttons:** 6px (rounded-md)
- **Badges:** 9999px (rounded-full)
- **Inputs:** 6px (rounded-md)
- **Modals:** 12px (rounded-xl)

## Component Patterns

### Job Card
- Surface background with border
- Left: status dot (8px circle) + job name (semibold) + last build info (muted)
- Right: trigger button (accent) + kebab menu
- Hover: elevated background transition

### Status Badge
- Pill shape, uppercase 11px, status-colored bg+text
- Prepend animated dot for "running" state (pulse animation)
- Fixed min-width (72px) for visual alignment in lists

### Trigger Parameter Form (Swagger-inspired)
- Each param in a bordered row: name (mono, semibold) + type badge + description
- Input types: text, select (choice), checkbox (boolean), file upload, password (masked)
- Default values pre-filled, required fields marked with red asterisk
- Collapsible sections for advanced parameters
- "Try it out" accent button at bottom (Swagger convention)

### Build Console
- Full-width, dark bg (#0a0a0a), mono font, green-tinted text (#4ade80)
- Line numbers in muted color, left-aligned
- Auto-scroll with "pin to bottom" toggle
- ANSI color support for build output

### Modal/Dialog
- Centered, max-width 640px, overlay backdrop
- Header: title + close button, border-bottom
- Body: scrollable content area
- Footer: action buttons right-aligned

### Dashboard Stats Card
- Icon (muted) + large number (primary) + label (secondary)
- Optional sparkline or trend indicator
- Compact: 120px min-width

## Iconography
- **Library:** Lucide React (consistent with shadcn/ui)
- **Size:** 16px default, 20px for primary actions, 14px inline
- **Style:** 1.5px stroke weight, currentColor

## Responsive Breakpoints
- **Mobile:** < 768px — single column, stacked cards
- **Tablet:** 768–1024px — 2-column grid
- **Desktop:** > 1024px — sidebar + main content, 3-column dashboard grid
- **Wide:** > 1440px — max-width container 1280px, centered

## Animation
- **Transitions:** 150ms ease for hover/focus, 200ms for modals
- **Loading:** Skeleton shimmer on cards (zinc-800 to zinc-700 gradient)
- **Running build:** Pulse animation on status dot (1.5s infinite)
- **Console stream:** Smooth scroll, no jarring jumps
- **Respect:** `prefers-reduced-motion: reduce` — disable non-essential animations

## Accessibility
- Minimum contrast: WCAG AA (4.5:1 text, 3:1 large text/UI)
- Focus rings: 2px blue-500 outline with 2px offset
- All interactive elements keyboard-navigable
- Status conveyed by text + color (never color alone)
- ARIA labels on icon-only buttons
- Skip navigation link

## Dark Theme shadcn/ui Overrides
Map to CSS variables in `globals.css`:
```
--background: 240 10% 3.9%;    /* zinc-950 */
--foreground: 0 0% 98%;        /* zinc-50 */
--card: 240 10% 9.8%;          /* zinc-900 */
--card-foreground: 0 0% 98%;
--primary: 217 91% 60%;        /* blue-500 */
--primary-foreground: 0 0% 100%;
--secondary: 240 5% 17%;       /* zinc-800 */
--destructive: 0 84% 60%;     /* red-500 */
--muted: 240 5% 26%;          /* zinc-700 */
--muted-foreground: 240 5% 64%; /* zinc-400 */
--accent: 240 5% 17%;
--border: 240 5% 17%;
--ring: 217 91% 60%;
```
