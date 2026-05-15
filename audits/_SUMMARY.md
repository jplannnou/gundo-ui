# Tier 1 Audit — Resumen Ejecutivo

**Fecha**: 2026-04-30
**Componentes auditados**: 18 (Tier 1 top-usage)
**Lentes aplicadas**: `/impeccable polish` + `/emil-design-eng` + `/a11y` + theme parity (dark + light)
**Base canon**: DESIGN.md, theme.css, CLAUDE.md (Sprint 1 cerrado)

---

## Tabla resumen 18 componentes

| Componente | Criticos | Polish | Taste | Theme parity | Status global |
|------------|---------:|-------:|------:|--------------|---------------|
| Button | 4 | 4 | 3 | OK con caveat (`#fff` hardcoded en danger) | drift menor |
| Card | 3 | 3 | 2 | OK con ajuste light surface-raised | drift menor |
| Input | 6 | 4 | 2 | parcial (fallbacks hex en style) | **alta deuda a11y** |
| Modal | 5 | 4 | 3 | OK | drift menor |
| Badge | 3 | 4 | 2 | parcial (warning/info contrast en small text) | OK |
| Avatar | 4 | 4 | 2 | OK | drift menor |
| KpiCard | 5 | 5 | 3 | OK | **alta deuda anti-pattern** |
| DataTable | 6 | 6 | 3 | OK | **alta deuda a11y** |
| Tabs | 4 | 5 | 3 | parcial (`text-white` hardcoded) | drift moderado |
| AlertBanner | 3 | 4 | 2 | parcial (warning text en small) | drift moderado |
| Spinner | 2 | 0 | 0 | OK | **a11y missing** |
| ProgressBar | 3 | 4 | 0 | parcial (track invisible en light) | drift menor |
| EmptyState | 5 | 4 | 2 | parcial (text-white hardcoded) | drift moderado |
| Toast | 3 | 4 | 1 | OK | drift menor |
| ToastProvider | 4 | 4 | 2 | OK | drift menor |
| Tooltip | 5 | 5 | 3 | **roto en light** (bg = app bg) | **alta deuda visual** |
| AppShell | 6 | 4 | 3 | OK | **alta deuda a11y mobile** |
| Sidebar | 5 | 6 | 3 | OK | drift moderado |
| ProductCard | 6 | 6 | 4 | OK | drift moderado |
| PricingCard | 6 | 7 | 3 | parcial (highlighted bg invisible en light) | drift moderado |

**Totales criticos**: ~83. **Totales polish**: ~91. **Totales taste**: ~43.

---

## Top 10 fixes safe (1 PR consolidado manana)

Estos son auto-mergeables — son drift puntual, anti-patterns documentados, o a11y tipica. Sin decisiones de taste.

1. **Anti-pattern uppercase tracking-wider** — eliminar de Input label, KpiCard heading, ProductCard brand (decision JP), PricingCard plan name, Sidebar group label. Cambiar a `text-sm font-medium` sentence case. **Files**: Input.tsx:15, KpiCard.tsx:72, PricingCard.tsx:75-76, Sidebar.tsx:121-123.

2. **Cambiar `text-[var(--ui-text-muted)]` -> `text-[var(--ui-text-secondary)]` cuando size < 18px** — falla AA contrast (3.5:1 vs 6.0:1). **Files**: Input.tsx:15, KpiCard.tsx:72, EmptyState.tsx:27, Sidebar.tsx:121-123, PricingCard.tsx:81, ProductCard.tsx:161/172/179, DataTable.tsx:129.

3. **Eliminar `text-white` hardcoded** — DESIGN.md anti-pattern explicito. Reemplazar con `text-[var(--ui-surface)]`. **Files**: Tabs.tsx:63, EmptyState.tsx:17, Button.css:29.

4. **A11y missing en Spinner + ProgressBar** — agregar `role="status"` + `aria-label` (Spinner) y `role="progressbar"` + aria-valuenow/min/max (ProgressBar). **Files**: Spinner.tsx:16-19, ProgressBar.tsx:14, 21-26.

5. **Input sin label htmlFor + sin aria-invalid/aria-describedby** — fail WCAG 1.3.1 + 3.3.1. Agregar `useId()` y wiring. **Files**: Input.tsx:14-39.

6. **Z-index hardcoded en Modal/ToastProvider** — usar `--ui-z-modal` (500) y `--ui-z-toast` (600). **Files**: Modal.tsx:61, ToastProvider.tsx:98.

7. **Modal body scroll lock + aria-label requirement** — sin title hoy queda sin nombre accesible; tampoco lockea scroll. **Files**: Modal.tsx:34-48, 70.

8. **DataTable rows con onRowClick sin keyboard activation** — fail WCAG 2.1.1. Agregar `tabIndex` + `onKeyDown`. **Files**: DataTable.tsx:158-164.

9. **AppShell mobile drawer sin focus trap, sin Escape, sin role=dialog** — fail accessibility patterns para overlays. **Files**: AppShell.tsx:67-97.

10. **`transition-all` -> property-specific con tokens** — anti-pattern (DESIGN.md:185). Replace en Card, ProgressBar, Tabs y Sidebar. **Files**: Card.tsx:24, ProgressBar.tsx:23, Tabs.tsx:61, Sidebar.tsx:61, multiple.

**Bonus low-effort safe**:
- Avatar `loading="lazy"` por default (Avatar.tsx:35).
- Toast role/aria-live conflict (Toast.tsx:42-43).
- Counter en ToastProvider via useRef (ToastProvider.tsx:43).
- Tooltip `delayDuration` prop default 500ms + Escape dismiss (Tooltip.tsx:31-32).

---

## Top 5 decisiones de taste para JP review

Estas requieren alineacion antes de implementar — son decisiones de identidad/arquitectura, no fixes mecanicos.

### 1. Trend pill pattern en KpiCard (afecta KpiCard + posiblemente Badge)
KpiCard hoy renderiza trend como `text-xs ↑ 12%` plain — DESIGN.md:186 explicita "Trend plain text = anti-pattern, usar pill". Decision:
- (A) Agregar pill internamente (consistente, pero "fuerza" estilo).
- (B) Exponer prop `trendVariant: 'plain' | 'pill'` (compat).
- (C) Cambiar API a aceptar `trend: ReactNode` y consumer pasa Badge directamente.

**Recomendacion**: B con default `pill` para nuevos consumers, `plain` opcional para compat.

### 2. Tooltip surface en theme actual = invisible en light theme
Tooltip usa `bg-[var(--ui-surface)]` que en light es el mismo color del body. Tooltip aparece sin container visual. Decision:
- (A) Cambiar default a `--ui-surface-raised`.
- (B) Introducir token nuevo `--ui-tooltip-bg` (mas explicito).
- (C) Migrar a `<Popover>` real con Floating UI (resuelve tooltip + collision detection + hoverable juntos).

**Recomendacion**: A inmediato + roadmap C para Q2.

### 3. Tabs variant pills vs underline + magic indicator
Hoy Tabs es solo "pills" (`bg-primary` solid). Patrones modernos (Linear, Vercel, Apple Music) usan "underline indicator" + slider con `layoutId` de Motion. Decision:
- (A) Solo cambiar default visual (pills mas suaves o underline) — riesgo de breaking visual.
- (B) Agregar `variant?: 'pills' | 'underline'` prop, default = pills (compat) — mas seguro.
- (C) Solo agregar magic indicator (slider) sin cambiar variants.

**Recomendacion**: B + C juntos, premium feel sin breaking.

### 4. Card-as-button vs Card + CardButton split
`Card` con `onClick` se vuelve `role="button"` y `tabIndex={0}`. Pattern: Cards que contienen `<a>` o `<button>` internos crean ARIA double-interactive. Decision:
- (A) Mantener Card actual + documentar limitacion.
- (B) Splittear en `Card` (presentacional) y `CardButton` (semantic button) — patron Radix.
- (C) Detectar children y advertir en dev.

**Recomendacion**: B — mas claro long term, breaking minimo (consumers que pasan onClick siguen funcionando si exportamos CardButton como alias).

### 5. Quicksand (font-display) opt-in en KpiCard / PricingCard
DESIGN.md regla 5: "Quicksand para hero numbers B2C, Montserrat para data dashboards". KpiCard y PricingCard estan en ambos contextos. Decision:
- (A) Default Montserrat (data-first), prop opcional `display?: boolean` para B2C.
- (B) Default Quicksand (assume B2C), prop opcional para data.
- (C) Variants explicitas: `<KpiCardData>` vs `<KpiCardHero>`.

**Recomendacion**: A — opt-in via prop, los dashboards (Engine/Radar/Finance/CC) ya usan Montserrat por default, B2C (Vida/Datacenter/Ametller) hacen opt-in.

---

## Patterns recurrentes detectados

### A11y misses sistemicas
1. **Anti-pattern `text-xs uppercase tracking-wider`** aparece en 5 componentes (Input, KpiCard, PricingCard, ProductCard, Sidebar) — el lib propaga el anti-pattern documentado en DESIGN.md.
2. **`--ui-text-muted` en text-sm/text-xs** — falla AA en al menos 8 componentes. Sprint 1 fixeo el TOKEN, pero los componentes siguen referenciandolo donde no toca.
3. **Interactive elements sin keyboard handlers** — Card, DataTable rows, ProductCard. Patron: usar `onClick` sin `tabIndex` ni `onKeyDown`.
4. **Overlays sin focus trap o Escape** — AppShell mobile drawer, Tooltip persistente. Modal lo tiene bien, los demas drift.
5. **Live regions ausentes** — Spinner, AlertBanner, EmptyState no anuncian a SR cuando aparecen dinamicamente.

### Drift respecto a tokens
1. **`transition-all`** en ~5 componentes (DESIGN.md anti-pattern).
2. **Easing/duration sin tokens** en Tooltip, Card, ProgressBar, Sidebar.
3. **Z-index hardcoded** en Modal, ToastProvider.
4. **`text-white` hardcoded** en Tabs, EmptyState, Button.css.
5. **`shadow-lg` Tailwind class** en Toast, Modal — no usa `--ui-shadow-lg` token.
6. **Padding fuera del scale** (`p-5`, `px-5`, `py-2.5`) en ProgressBar, KpiCard, Toast.

### Theme parity
1. **Light theme tooltips invisibles** — `--ui-surface` igual a body bg (Tooltip critical).
2. **Light theme highlighted weak** — `--ui-primary-soft` light es muy debil para PricingCard highlighted state.
3. **Light theme track invisible** — ProgressBar `--ui-surface-hover` light es 0.04 opacity, casi imperceptible.
4. **Light theme header/sidebar sin diferenciacion** — `--ui-surface` igual al main bg, header se mimetiza.

### Motion/feel gaps (Emil-tier)
1. **Snap transitions** en Sort icon de DataTable, icon swap de SidebarToggle, dismissal de AlertBanner — falta crossfade/rotate.
2. **Sin layoutId magic indicators** en Tabs (oportunidad clara).
3. **Sin cross-fade en value changes** en KpiCard (DESIGN.md:124 explicito).
4. **Sin animation enter/exit** en AlertBanner, EmptyState, mobile drawer AppShell.
5. **`scale + y + opacity` triplet** en Modal, ToastProvider — Emil pattern es 1-2 axes max.

### API drift
1. **API aliases multiples** (`title`/`label`, `valueClassName`/`color`) — KpiCard. DESIGN.md:187 anti-pattern.
2. **Hardcoded ES strings** — ProductCard `"Anadir"/"Anadido"/"En el carrito"`, Button `"Loading..."` (EN). Inconsistente.
3. **Inline `style` con fallback hex** en Input — defensive pero crea drift cuando tokens no se cargan correcto.

---

## Recomendacion final del audit

**PR Safe Sprint manana**: ataca los 10 puntos de top fixes safe en 1 PR consolidado. Estimacion: ~3-5 horas. Riesgo bajo.

**Decisiones de taste**: agendar review 30 min con JP para alinear los 5 puntos. Cada decision desbloquea 2-4 fixes asociados.

**Sprint 2 (post safe)**:
- Tooltip migration a Popover/Floating UI (1-2 dias).
- DataTable enhancements: loading state, sticky header, sort icon mejor (1 dia).
- KpiCard trend pill + Quicksand opt-in (medio dia).
- Tabs underline variant + magic indicator (1 dia).

**Sprint 3 (theme parity sweep)**:
- Light theme audit dedicada: tooltip bg, highlighted weak, track invisible, header diferenciacion. 1-2 dias.
- Light theme contrast sweep (warning/info en dark vs light).

**Inputs no auditados** (fuera del Tier 1): los 96 componentes restantes. Sospecha: patterns identicos repetidos (uppercase tracking-wider, text-muted en small, keyboard misses).
