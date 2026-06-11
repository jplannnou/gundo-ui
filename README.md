# @gundo/ui

Shared React component library for Gundo platform projects (Engine, Finance, Radar, JP Assistant).

## Install

Projects consume this package via `file:` protocol in their `package.json`:

```json
{
  "dependencies": {
    "@gundo/ui": "file:../../gundo-ui"
  }
}
```

Then re-export from your project's `ui/index.ts`:

```ts
export { Button, Card, Modal, Spinner /* ... */ } from '@gundo/ui';
```

## Theming

All components use CSS custom properties (`--ui-*`). Import `@gundo/ui/theme.css` for dark-theme defaults, then override in your project's CSS:

```css
@import '@gundo/ui/theme.css';

:root {
  --ui-primary: #3b82f6; /* change accent to blue */
}
```

### Token reference

| Token | Description | Default (dark) |
|---|---|---|
| `--ui-primary` | Accent color for buttons, links, focus rings | `#10b981` |
| `--ui-primary-hover` | Hover state for primary | `#059669` |
| `--ui-primary-soft` | Tinted background for primary badges/banners | `rgb(16 185 129 / 0.15)` |
| `--ui-surface` | Card/panel background | `#111111` |
| `--ui-surface-raised` | Slightly elevated surface | `rgb(255 255 255 / 0.02)` |
| `--ui-surface-hover` | Surface hover/input background | `rgb(255 255 255 / 0.05)` |
| `--ui-border` | Default border | `rgb(255 255 255 / 0.1)` |
| `--ui-border-hover` | Hover/focus border | `rgb(255 255 255 / 0.2)` |
| `--ui-text` | Primary text | `#ffffff` |
| `--ui-text-secondary` | Secondary text | `#9ca3af` |
| `--ui-text-muted` | Muted/placeholder text | `#6b7280` |
| `--ui-success` | Success semantic | `#10b981` |
| `--ui-error` | Error/danger semantic | `#ef4444` |
| `--ui-warning` | Warning semantic | `#f59e0b` |
| `--ui-info` | Info semantic | `#3b82f6` |
| `--ui-overlay` | Modal/drawer backdrop | `rgb(0 0 0 / 0.6)` |

A built-in `.theme-light` class provides light-mode overrides. Apply with `<html class="theme-light">`.

## Components

### Layout
- **Card** - Bordered surface container (`className`)
- **Container** - Max-width centered wrapper (`maxWidth`, `className`)
- **Divider** - Horizontal rule (`className`)
- **Stack** - Flex column with gap (`gap`, `className`)

### Navigation
- **Breadcrumbs** - Path navigation (`items: {label, href?}[]`)
- **Tabs** - Tab switcher (`tabs: {id, label}[]`, `activeTab`, `onTabChange`)
- **StepIndicator** - Multi-step progress (`steps: string[]`, `currentStep`)
- **Pagination** - Page navigation (`page`, `totalPages`, `onPageChange`, `total?`, `pageSize?`)

### Forms
- **Button** - Action button (`variant`, `size`, `loading`, `disabled`)
- **Input** / **Select** - Text input / select dropdown (extends native attrs)
- **Textarea** - Multi-line text (extends native attrs)
- **Checkbox** - Checkbox with label (`label`, `checked`, `onChange`)
- **Toggle** - Switch toggle (`checked`, `onChange`, `label`)
- **SearchInput** - Search field with icon and clear button (`onClear`, extends input)
- **FormField** - Label + input + error wrapper (`label`, `error`, `children`)

### Feedback
- **AlertBanner** - Status banner (`type: success|error|warning|info`, `children`)
- **Spinner** - Loading spinner (`size: sm|md|lg`, `className`)
- **ProgressBar** - Progress indicator (`value: 0-100`, `className`)
- **Skeleton** / **SkeletonText** - Loading placeholders (`className` / `lines`)
- **Toast** - Notification toast (`type`, `message`, `onClose`)
- **EmptyState** - Empty content placeholder (`title`, `description`, `action?`)
- **ErrorBoundary** - React error boundary (`fallback?`, `children`)
- **ErrorRetry** - Error with retry button (`message`, `onRetry`)

### Overlay
- **Modal** - Dialog overlay (`open`, `onClose`, `title`, `children`)
- **ConfirmDialog** - Confirmation modal (`open`, `onConfirm`, `onClose`, `title`, `description`, `variant: danger|primary`)
- **Drawer** - Side panel (`open`, `onClose`, `title`, `children`, `side: left|right`)
- **DropdownMenu** - Popover menu (`trigger`, `items: {label, onClick}[]`)
- **Tooltip** - Hover tooltip (`content`, `children`)

### Data
- **DataTable** - Generic typed table (`columns: Column<T>[]`, `data: T[]`, `onSort?`, `onRowSelect?`)
- **Badge** - Status/count badge (`variant`, `children`)
- **Avatar** - User avatar (`src?`, `name`, `size`)

### Utility
- **Accordion** / **AccordionItem** - Collapsible sections (`children`)

## Learn system

The GUNDO Learn system (`src/learn/`) is the shared education/onboarding layer
for every GUNDO product. Philosophy:

1. **Every data request explains what it unlocks** — asking for a blood test
   shows the parameters and personalization the user gains (`UnlockRing`,
   `EmptyStateEducation`), never a bare form.
2. **Every result explains where it comes from and leads to an action** —
   recommendations carry their signals (`WhyPanel`: source → evidence →
   action), no black boxes and no invented data.

Shared rules: all components honor `prefers-reduced-motion` (final state
renders instantly), all copy enters via props (i18n-agnostic — the library
ships no strings), touch targets are ≥44px, and colors come exclusively from
`--ui-*` tokens.

| Component | Use for |
|---|---|
| `TourProvider` / `TourStep` / `Spotlight` | First-run spotlight tour (max 4 steps; persistence delegated to the host) |
| `ExplainerFlow` | "How it works" pages with numbered steps + real-signal chips |
| `WhyPanel` | The unified "why" behind any recommendation (supersedes `RecipeReasoningPills` for new surfaces) |
| `EmptyStateEducation` | Empty states that teach what the user unlocks (always requires an `.Action` — anti-dead-end) |
| `ProgressCelebration` | Contained milestone celebration with particle burst + count-up |
| `UnlockRing` | Progress framing of unlocked data/parameters (never debt framing) |
| `PersonalizedLoader` | Long waits with storytelling phases + timeout exit (`errorState`) |
| `FeatureHighlight` | "Nuevo"/"Tip" badge that pulses twice and stops |

### WhyPanel example

```tsx
<WhyPanel
  ariaLabel="Por qué te recomendamos esto"
  signals={[
    {
      source: 'blood',
      label: 'Ferritina baja',
      evidence: 'Ferritina 28 ng/mL (rango óptimo 50-150). Esta receta aporta hierro hemo.',
      impact: 'caution',
      action: { label: 'Ver mi analítica', href: '/results/blood' },
    },
    { source: 'goal', label: 'Alineado con tu objetivo de energía', impact: 'positive' },
  ]}
/>
```

### GuidedTour example

```tsx
const [tourOpen, setTourOpen] = useState(() => !localStorage.getItem('tour-home-v1'));
const dismiss = () => { localStorage.setItem('tour-home-v1', '1'); setTourOpen(false); };

<TourProvider
  isOpen={tourOpen}
  onComplete={dismiss}
  onSkip={dismiss}
  labels={{ next: 'Siguiente', back: 'Atrás', skip: 'Saltar', done: 'Listo', progress: (c, t) => `${c} de ${t}` }}
  steps={[
    { target: resultsRef, title: 'Tus resultados', body: 'Todo lo que desbloqueaste con tus tests.' },
    { target: '#upload-cta', title: 'Subí un test', body: 'Cada test desbloquea más personalización.' },
  ]}
>
  {/* page content */}
</TourProvider>
```

Motion primitives ported from Gundo Vida live in `src/motion/`:
`RevealOnScroll`, `AnimatedCounter`, `TypeWriter`, `PulseGlow`,
`FloatingElement` (plus the existing `FadeIn`, `PageTransition`,
`AnimatedOverlay`).

## Consuming projects

| Project | Path | Re-export |
|---|---|---|
| Gundo Engine | `~/projects/Gundo_Engine/frontend/src/ui/index.ts` | Full barrel |
| Gundo Finance | `~/projects/Gundo_Finance/frontend/src/ui/index.ts` | Full barrel |
| Gundo Radar | `~/projects/Gundo_Radar/client/src/ui/index.ts` | Full barrel |
| JP Assistant | `~/projects/jp-assistant/frontend/src/ui/index.ts` | Full barrel |

## Development

```bash
# Type-check
pnpm exec tsc --noEmit

# After editing, refresh symlinks in consumer projects
cd ~/projects/Gundo_Engine && pnpm install
```

No build step needed — consumer projects import TypeScript source directly via `file:` links.
