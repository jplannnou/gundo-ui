# @gundo/ui — Shared Component Library

## Architecture
- **Package**: `@gundo/ui` v0.1.0 (local pnpm workspace dependency)
- **No build step**: Consumers import TypeScript source directly
- **Theming**: CSS Custom Properties contract (`--ui-*` tokens)
- **Stack**: React 19 + TypeScript + CSS Custom Properties
- **Consumer projects**: Gundo Engine, Gundo Finance, Gundo Radar, JP Assistant
- **Tests**: 40 test files, 169 tests (Vitest + React Testing Library)

## Design System Tokens (theme.css)

```css
/* Primary (emerald accent) */
--ui-primary: #10b981;  --ui-primary-hover: #059669;
--ui-primary-soft: rgb(16 185 129 / 0.15);

/* Surfaces (dark-first) */
--ui-surface: #111111;
--ui-surface-raised: rgb(255 255 255 / 0.02);
--ui-surface-hover: rgb(255 255 255 / 0.05);

/* Borders */
--ui-border: rgb(255 255 255 / 0.1);  --ui-border-hover: rgb(255 255 255 / 0.2);

/* Text */
--ui-text: #ffffff;  --ui-text-secondary: #9ca3af;  --ui-text-muted: #6b7280;

/* Semantic + soft variants */
--ui-success: #10b981;  --ui-error: #ef4444;
--ui-warning: #f59e0b;  --ui-info: #3b82f6;

/* Typography */
--ui-font-family: 'Inter', system-ui, sans-serif;
--ui-font-mono: 'JetBrains Mono', monospace;
--ui-font-size-xs..2xl: 0.75rem..1.5rem;

/* Border radius */
--ui-radius-sm: 0.25rem;  --ui-radius-md: 0.5rem;
--ui-radius-lg: 0.75rem;  --ui-radius-xl: 1rem;

/* Shadows, Animation, Z-index */
--ui-shadow-sm/md/lg;  --ui-duration-fast/normal/slow;
--ui-z-dropdown: 50;  --ui-z-modal: 500;  --ui-z-toast: 600;
```

Light theme via `.theme-light` class (overrides shadows, colors).

## Components (40 total)

**Layout**: Card, Container, Divider, Stack
**Navigation**: Breadcrumbs, Tabs, StepIndicator, Pagination
**Forms**: Button, Input, Select, Textarea, Checkbox, Toggle, SearchInput, FormField, Combobox, TagsInput, SegmentedControl, FileUpload
**Feedback**: AlertBanner, Spinner, ProgressBar, Skeleton, SkeletonText, Toast, ToastProvider, EmptyState, ErrorBoundary, ErrorRetry, KpiCard
**Overlay**: Modal (with size prop), ConfirmDialog, Drawer, DropdownMenu, Tooltip, Popover
**Data**: DataTable, Badge, Avatar
**Compound**: Sidebar (Header/Content/Footer/Group/Item/Toggle), Accordion/AccordionItem

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
