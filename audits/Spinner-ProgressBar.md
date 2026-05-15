# Audit — Spinner + ProgressBar

**Fecha**: 2026-04-30
**Source**: src/Spinner.tsx (LOC: 22), src/ProgressBar.tsx (LOC: 30)

---

## Spinner

### Fortalezas
- API minima, 4 sizes.
- Usa `--ui-primary` para color via border.
- `border-t-transparent` + `animate-spin` — pattern eficiente sin SVG.

### Issues criticos
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Sin `role="status"` ni `aria-label` — SR no anuncia "loading". | Spinner.tsx:16-19 | Agregar `role="status"` y `aria-label="Loading"` o prop `label?: string` con fallback. |
| C2 | El spinner es solo visual — no hay live region. Si reemplaza contenido (e.g., button content), el SR no detecta cambio. | Spinner.tsx:16-19 | Combinar con `aria-live="polite"` cuando relevante o documentar pattern de uso. |

### Polish / Taste
- `animate-spin` Tailwind default es `linear infinite 1s` — OK, pero Emil-tier seria un easing mas natural en edges. Decision: no urgente.
- `border-t-transparent` deja un ring incompleto que comunica spinning — patron correcto.
- `border-2`/`border-[3px]` — trick para que size lg tenga ring mas grueso. Bien.

### Theme parity
- Tokens hardcoded? **No.**
- Light theme: `--ui-primary` cambia a verde oscuro — visible sobre light surface.

---

## ProgressBar

### Fortalezas
- API simple: `value`, `max` con clamp.
- Optional label + percentage display.
- Custom color override.

### Issues criticos
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Sin `role="progressbar"` ni `aria-valuenow`/`aria-valuemin`/`aria-valuemax`. **Falla WCAG 4.1.2.** | ProgressBar.tsx:14, 21-26 | Agregar al outer div `role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label \|\| 'Progress'}`. |
| C2 | Si `max=0`, `(value/max)*100` = `Infinity` o `NaN` — el clamp lo convierte en 100, pero es bug oculto. | ProgressBar.tsx:11 | Guard: `max <= 0 ? 0 : (value/max)*100`. |
| C3 | Label color `--ui-text-secondary` en `text-xs` (12px) — `text-secondary` en dark `#9ca3af` da ~6.0:1 (OK), pero `--ui-text-muted` (`#6b7280` 3.5:1) usaria si se hubiera puesto secondary. Aca es secondary, OK. | ProgressBar.tsx:16 | OK. |

### Polish / Taste
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | `transition-all duration-300` — anti-pattern (DESIGN.md:185). | ProgressBar.tsx:23 | `transition-[width] duration-[var(--ui-duration-slow)] ease-[var(--ui-ease-out)]`. |
| P2 | Color prop acepta cualquier string — TypeScript no enforza tokens. Drift facil. | ProgressBar.tsx:6 | Restringir a union: `color?: 'primary' | 'success' | 'warning' | 'error'` o aceptar cualquier string pero documentar uso de tokens. |
| P3 | No hay variant `striped` ni indeterminate state. | ProgressBar.tsx:14-27 | Para indeterminate (loading sin %), agregar prop `indeterminate?: boolean` con animacion stripes. |
| P4 | Height `h-2` (8px) fijo — no scaling para "compact" o "prominent" usos. | ProgressBar.tsx:21 | Prop `size?: 'sm' | 'md' | 'lg'`. |

### Theme parity
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si** — todos los colores via tokens.
- Issue light: `--ui-surface-hover` light es `rgb(0 0 0 / 0.04)` — track muy sutil, casi invisible. ProgressBar puede perderse hasta llenarse. Considerar `--ui-border` (`rgb(0 0 0 / 0.1)`) para track.

---

## Recommended PR scope (combinado)

### Safe fixes (auto-merge)
- Spinner C1 (`role="status"` + `aria-label`)
- ProgressBar C1 (`role="progressbar"` + aria-valuenow/min/max)
- ProgressBar C2 (guard `max<=0`)
- ProgressBar P1 (eliminar `transition-all`)

### Taste fixes (require review)
- Spinner C2 (live region pattern doc)
- ProgressBar P2 (color union type vs string)
- ProgressBar P3 (indeterminate variant)
- ProgressBar P4 (size prop)
- Boost track color en light theme (token global)

### Skip
- Spinner: nada mas
- ProgressBar: nada
