# DESIGN — @gundo/ui

Design system canónico. Source of truth: `src/theme.css`. Este documento explica intent + reglas de uso por encima de los tokens.

## Color

### Brand
| Token | Hex | Uso |
|-------|-----|-----|
| `--ui-primary` | `#67C728` | Primary actions, brand accent — GUNDO green vivo |
| `--ui-primary-hover` | `#5ab322` | Estado hover de primary |
| `--ui-primary-soft` | `rgba(103,199,40,0.15)` | Backgrounds sutiles, badges, soft fills |
| `--ui-secondary` | `#08563E` | Deep dark green — auth, cabezales, brand-heavy |
| `--ui-tertiary` | `#24495A` | Dark teal — alternative depth, charts |
| `--ui-gradient` | `linear-gradient(135deg, #24495A, #409C35)` | Hero CTAs, marketing surfaces |

### Surface (dark-first)
| Token | Valor | Uso |
|-------|-------|-----|
| `--ui-surface` | `#292E37` | Background base. **NUNCA `#000` ni `#1a1a1a`** — debe tener tinte cálido |
| `--ui-surface-raised` | `rgba(255,255,255,0.04)` | Cards sobre surface, inputs |
| `--ui-surface-hover` | `rgba(255,255,255,0.07)` | Hover de listas/items clickeables |

### Text
| Token | Valor | Uso |
|-------|-------|-----|
| `--ui-text` | `#F2F4F3` | Texto primario — warm off-white, no pure white |
| `--ui-text-secondary` | `#9ca3af` | Subtítulos, metadata |
| `--ui-text-muted` | `#6b7280` | ⚠ Contrast 3.5:1 — solo large text (≥18px o ≥14px bold) o decorativo |

### Semantic
- `--ui-success` `#22c55e` (con soft variant)
- `--ui-error` `#ef4444` (con soft variant)
- `--ui-warning` `#f59e0b` (con soft variant) — ⚠ falla AA en light theme
- `--ui-info` `#3b82f6` (con soft variant) — ⚠ falla AA en dark normal text

### Reglas de uso color
1. **Nunca hardcodear hex** — siempre `var(--ui-*)`
2. **Nunca pure black/white** — usar surface y text tokens
3. **Color tiene significado consistente** — success siempre verde semantic, error siempre rojo, brand verde siempre #67C728. No mezclar.
4. **Soft variants para fills sutiles** — `*-soft` es el background bajo, el color base es el texto/border
5. **Gray on color = no** — texto sobre fondo coloreado debe ser variante del mismo color o transparency, no `text-muted`

## Typography

### Families
- **`--ui-font-family`** Montserrat — texto, body, UI labels (default)
- **`--ui-font-display`** Quicksand — headings hero, marketing, números KPI hero, B2C delight
- **`--ui-font-mono`** JetBrains Mono — code, data tables densa, IDs

### Scale
```
--ui-font-size-xs:   0.75rem  (12px)  — captions, metadata
--ui-font-size-sm:   0.875rem (14px)  — small UI text
--ui-font-size-base: 1rem     (16px)  — body
--ui-font-size-lg:   1.125rem (18px)  — emphasized body
--ui-font-size-xl:   1.25rem  (20px)  — section titles
--ui-font-size-2xl:  1.5rem   (24px)  — page titles, KPI standard
```

### Reglas tipografía
1. **Sentence case por default**, NO uppercase tracking-wider en headings (anti-pattern de dashboards 2018)
2. **Tabular-nums siempre** que haya números: KPIs, prices, percentages, counters
3. **Line-height** `--ui-leading-tight` (1.25) headings, `--ui-leading-normal` (1.5) body, `--ui-leading-relaxed` (1.75) marketing prose
4. **Font weight** scale: 400 normal / 500 medium / 600 semibold / 700 bold. **Evitar 800-900** — no son parte del system
5. **Quicksand para hero numbers** B2C (Vida, Datacenter, Ametller marketing). Montserrat semibold/bold para data dashboards (Engine, Radar, Finance, Command Center)
6. **Body text mínimo 14px** mobile, 16px desktop

## Spacing

```
--ui-space-1: 0.25rem  (4px)
--ui-space-2: 0.5rem   (8px)
--ui-space-3: 0.75rem  (12px)
--ui-space-4: 1rem     (16px)
--ui-space-6: 1.5rem   (24px)
--ui-space-8: 2rem     (32px)
```

**Regla:** todo gap, padding, margin debe usar uno de estos 6 valores. `p-5` (20px), `mt-7` (28px), gaps de 13px o 18px = drift, no permitido.

## Border radius

```
--ui-radius-sm:   0.25rem  (4px)   — badges, tags chicos
--ui-radius-md:   0.5rem   (8px)   — buttons, inputs, small cards
--ui-radius-lg:   0.75rem  (12px)  — cards estándar
--ui-radius-xl:   1rem     (16px)  — hero cards, modals
--ui-radius-full: 9999px            — avatars, pills, circles
```

## Elevation (shadows)

3 niveles + scope dark/light theme-aware:
- `--ui-shadow-sm` — cards en reposo
- `--ui-shadow-md` — cards on hover, dropdowns
- `--ui-shadow-lg` — modals, drawers

Light theme overrides para mantener perceptual depth (no usar mismas opacities que dark).

## Motion

### Easing tokens
```
--ui-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ui-ease-out:    cubic-bezier(0, 0, 0.2, 1)
```

**Regla Emil:** los easings built-in de CSS son débiles. Usar siempre los tokens del system, no `ease-in-out` de Tailwind directo.

### Duration
- `--ui-duration-fast`   100-150ms — button press, hover color
- `--ui-duration-normal` 200-250ms — dropdowns, tooltips, popovers
- `--ui-duration-slow`   300-400ms — modals, drawers, page transitions

**Cap absoluto:** UI animations <300ms. Excepción: marketing/onboarding storytelling.

### Reglas motion
1. **Never animate keyboard-frequent actions** — CommandPalette no tiene animation de open/close. Raycast-style.
2. **Ease-out para enter** (responsive feel), **ease-in-out para movement on screen**, **ease para hover/color**
3. **Nunca `ease-in`** para UI — siente lento
4. **`prefers-reduced-motion`** respetado — usar `useReducedMotion()` hook
5. **Springs (Motion lib)** para drag, gestures, mouse-tracking decorativo. Configuración Apple-style: `{ duration: 0.5, bounce: 0.2 }`. Nunca bounce >0.3
6. **Tabular-nums + cross-fade** en value changes (KPIs, counters)

## Component conventions

### API
- Polimorfismo via `as` prop cuando relevante (Button, Card, Stack)
- Compound components para piezas complejas (Sidebar.Header, Sidebar.Content, etc.)
- TypeScript strict — todas las props tipadas, exports de tipos junto al componente
- `className` siempre disponible para extender styling
- Forwards `ref` cuando aplica

### Composición
- **Dashboard** = `KpiCard` row + chart wrappers + `DataTable`
- **Settings** = `Stack` vertical + `FormField` + `SaveBar` sticky
- **List view** = `FilterBar` + `Table` o `Card` grid + `Pagination`
- **Detail view** = `DetailHeader` + `DetailTabs` + content
- **Onboarding** = `StepWizard` + `MagicLinkAuth`

### Estados interactivos requeridos
Cada componente interactivo tiene: default / hover / focus-visible / active / disabled / loading / error / success.

Falta de cualquiera = bug pre-merge.

## Accesibilidad

- **Focus ring**: `--ui-focus-ring: 0 0 0 2px var(--ui-primary)` — visible en TODO interactive element
- **Keyboard navigation**: arrow keys en DropdownMenu/DataTable/SegmentedControl/Tooltip/RadioGroup/NumberInput/DatePicker/CommandPalette
- **Focus trapping**: Modal/Drawer/Sheet/CommandPalette via `useFocusTrap`
- **ARIA**: `role`, `aria-label`, `aria-live` correctos
- **Tests**: 58 axe-core automated, además skill `/a11y` para contrast/keyboard/checklist

## Light vs Dark

Default: dark. Light vía `.theme-light` class en root o `<ThemeProvider>`.

Reglas:
1. Componentes deben funcionar en ambos sin if/else por theme
2. Light theme override solo de tokens — no override de layout/spacing
3. Shadows distintos por theme (dark usa rgba más opaca)
4. Algunas semantic colors fallan AA en un theme — flagged en tabla, evitar usar en small text en ese theme

## Iconos

- Source: `lucide-react` re-exportado via `src/icons.ts`
- Tamaños estándar: `size-3` (12px) inline, `size-4` (16px) UI default, `size-5` (20px) prominent, `size-6` (24px) hero
- Color: heredan `currentColor` — no hardcodear color en svg

## Charts

- Wrappers en `src/charts/` (peerDep recharts)
- Color tokens dedicados: `chartColors.semantic.success/warning/error/info`, `chartColors.brand.primary/secondary/tertiary`
- Tooltip: usar `ChartTooltip` compartido, no recharts default

## Anti-patterns documentados

| Anti-pattern | Por qué evitarlo | Hacer en su lugar |
|--------------|------------------|--------------------|
| `text-xs uppercase tracking-wider` headings | Dashboard 2018 | `text-sm font-medium text-fg-muted` sentence case |
| Gradient cards `from-purple to-pink` | Tailwind tutorial slop | Solid surfaces + 1 brand accent |
| Pure white `#fff` text | Lavado, no GUNDO | `var(--ui-text)` `#F2F4F3` |
| `border border-gray-300` | Hardcoded fuera del theme | `border-edge` mapeado a token |
| `transition-all duration-300` | Performance + spec vaga | Especificar property: `transition-transform duration-200 ease-[var(--ui-ease-out)]` |
| Trend "↑ 12%" plain text | Loses visual weight | Pill: `bg-success-soft text-success rounded-full px-2` |
| Múltiples API aliases (`title` + `label`) | Compatibility creep | Una API canónica, deprecar el resto |
