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
