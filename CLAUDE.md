# @gundo/ui — Shared Component Library

## Architecture
- **Package**: `@gundo/ui` v1.0.0 (local pnpm workspace dependency)
- **No build step**: Consumers import TypeScript source directly
- **Theming**: CSS Custom Properties contract (`--ui-*` tokens)
- **Stack**: React 19 + TypeScript + CSS Custom Properties
- **Consumer projects**: Gundo Engine, Gundo Finance, Gundo Radar, JP Assistant
- **Tests**: 250 tests (Vitest + React Testing Library), including 43 axe-core accessibility tests

## Design System Tokens (theme.css) — Brandbook v1 aligned

```css
/* Primary — GUNDO green */
--ui-primary: #67C728;  --ui-primary-hover: #5ab322;
--ui-primary-soft: rgb(103 199 40 / 0.15);

/* Secondary — deep dark green */
--ui-secondary: #08563E;  --ui-secondary-hover: #064a35;
--ui-secondary-soft: rgb(8 86 62 / 0.15);

/* Tertiary — dark teal */
--ui-tertiary: #24495A;  --ui-tertiary-hover: #1e3d4c;
--ui-tertiary-soft: rgb(36 73 90 / 0.15);

/* Brand gradient */
--ui-gradient: linear-gradient(135deg, #24495A, #409C35);

/* Surfaces — brandbook charcoal (dark-first) */
--ui-surface: #292E37;
--ui-surface-raised: rgb(255 255 255 / 0.04);
--ui-surface-hover: rgb(255 255 255 / 0.07);

/* Borders */
--ui-border: rgb(255 255 255 / 0.1);  --ui-border-hover: rgb(255 255 255 / 0.2);

/* Text — brandbook warm off-white */
--ui-text: #F2F4F3;  --ui-text-secondary: #9ca3af;  --ui-text-muted: #6b7280;

/* Semantic + soft variants */
--ui-success: #22c55e;  --ui-error: #ef4444;
--ui-warning: #f59e0b;  --ui-info: #3b82f6;

/* Typography — Montserrat (main) + Quicksand (display) */
--ui-font-family: 'Montserrat', system-ui, sans-serif;
--ui-font-display: 'Quicksand', 'Montserrat', sans-serif;
--ui-font-mono: 'JetBrains Mono', monospace;
--ui-font-size-xs..2xl: 0.75rem..1.5rem;

/* Border radius */
--ui-radius-sm: 0.25rem;  --ui-radius-md: 0.5rem;
--ui-radius-lg: 0.75rem;  --ui-radius-xl: 1rem;

/* Focus ring */
--ui-focus-ring: 0 0 0 2px var(--ui-primary);

/* Font weights */
--ui-font-weight-normal: 400;  --ui-font-weight-medium: 500;
--ui-font-weight-semibold: 600;  --ui-font-weight-bold: 700;

/* Line heights */
--ui-leading-tight: 1.25;  --ui-leading-normal: 1.5;  --ui-leading-relaxed: 1.75;

/* Spacing scale */
--ui-space-1: 0.25rem;  --ui-space-2: 0.5rem;  --ui-space-3: 0.75rem;
--ui-space-4: 1rem;  --ui-space-6: 1.5rem;  --ui-space-8: 2rem;

/* Easing */
--ui-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ui-ease-out: cubic-bezier(0, 0, 0.2, 1);

/* Shadows, Animation, Z-index */
--ui-shadow-sm/md/lg;  --ui-duration-fast/normal/slow;
--ui-z-dropdown: 50;  --ui-z-modal: 500;  --ui-z-toast: 600;
```

Light theme via `.theme-light` class (overrides shadows, colors).

## Components (41 total)

**Layout**: Card, Container, Divider, Stack
**Navigation**: Breadcrumbs, Tabs, StepIndicator, Pagination
**Forms**: Button, Input, Select, Textarea, Checkbox, Toggle, SearchInput, FormField, Combobox, TagsInput, SegmentedControl, FileUpload
**Feedback**: AlertBanner, Spinner, ProgressBar, Skeleton, SkeletonText, Toast, ToastProvider, EmptyState, EmptyStateIllustration, ErrorBoundary, ErrorRetry, KpiCard
**Overlay**: Modal (with size prop), ConfirmDialog, Drawer, DropdownMenu, Tooltip, Popover
**Data**: DataTable, Badge, Avatar
**Compound**: Sidebar (Header/Content/Footer/Group/Item/Toggle), Accordion/AccordionItem

## Accessibility (WCAG AA)

- **focus-visible** on all 16 interactive components (Button, Input, Select, Textarea, Checkbox, Toggle, SearchInput, Combobox, TagsInput, SegmentedControl, FileUpload, Tabs, Pagination, DropdownMenu, DataTable, Tooltip)
- **Keyboard navigation**: Arrow keys in DropdownMenu, DataTable, SegmentedControl, Tooltip
- **Focus trapping**: Modal, Drawer (via `useFocusTrap` hook)
- **axe-core testing**: 43 automated accessibility tests
- **Utility export**: `useFocusTrap` — reusable hook for focus trapping in overlay components

## Rules for New Components

1. **Use CSS Custom Properties** — always reference `var(--ui-*)` tokens, never hardcode colors
2. **Dark-first** — default theme is dark; light is opt-in via `.theme-light`
3. **Accessibility** — all components must have proper ARIA attributes
4. **Peer dependency**: React 19 only
5. **Export from index.ts** — every new component must be added to `src/index.ts`
6. **TypeScript source only** — no build step, consumers handle transpilation
7. **Test with Vitest** — add tests in `src/__tests__/`

## Consumer Adoption

All projects use Tailwind 4 `@theme` directive mapping `--ui-*` tokens to utilities (`bg-surface`, `text-fg`, `border-edge`, `text-brand`, etc.).

| Project | Adoption | Notes |
|---------|----------|-------|
| Engine | ~84% | Chart components excluded |
| Finance | ~84% | Chart wrappers excluded |
| Radar | ~65% | Filter pills/sidebar nav custom |
| JP Assistant | ~79% | Only LoginPage excluded |

## Design Intelligence

- **UI/UX Pro Max Skill**: `.claude/skills/ui-ux-pro-max/`
- **Google Stitch**: 8 screens generated in project `15679055516069267003`
- **21st.dev Magic MCP**: Available but returns generic responses
