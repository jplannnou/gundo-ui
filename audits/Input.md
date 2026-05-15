# Audit — Input (+ Select)

**Fecha**: 2026-04-30
**Source**: src/Input.tsx (LOC: 79)

## Fortalezas
- `forwardRef` correcto.
- Estado de error claro con border + helper text.
- Inline `style` con fallback hex — defensivo si tokens no estan definidos por el consumer.
- Focus ring + offset configurados.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | El `<label>` NO esta asociado al `<input>` — no hay `htmlFor` ni el input esta wrapped. Screen reader no anuncia el label cuando enfocas el input. **Falla WCAG 1.3.1 + 4.1.2.** | Input.tsx:14-18, 19-33 | Generar `id` con `useId()` y conectar `<label htmlFor={id}>` + `<input id={id}>`. Mismo fix en `Select`. |
| C2 | Error message NO esta asociado al input via `aria-describedby` ni `aria-invalid`. Screen reader nunca anuncia el error. **Falla WCAG 3.3.1.** | Input.tsx:34-36 | Agregar `aria-invalid={!!error}` y `aria-describedby={error ? errorId : undefined}` con `<p id={errorId}>`. |
| C3 | Label usa `text-xs uppercase tracking-wider` — DESIGN.md:181 lo lista como anti-pattern explicito ("Dashboard 2018"). | Input.tsx:15 | Cambiar a `text-sm font-medium text-[var(--ui-text-secondary)]` sentence case. |
| C4 | `text-xs` (12px) en label viola "Body text minimo 14px" — DESIGN.md:67. Y el contraste de `--ui-text-muted` 3.5:1 falla AA en 12px. | Input.tsx:15 | Subir a `text-sm` minimo + cambiar a `--ui-text-secondary`. |
| C5 | Input NO tiene `disabled` style explicito — el browser default es feo y el contraste puede fallar. | Input.tsx:19-33 | Agregar `disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--ui-surface)]`. |
| C6 | `<select>` nativo en consumer dark theme renderiza dropdown con colors del SO (white background en muchos OS) — drift visual fuerte. | Input.tsx:55-72 | Documentar limitacion o swap a custom `<Select>` (puede haber Combobox ya en el lib). |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Border 1px sin contraste en focus — `focus:border-[var(--ui-primary)]` cambia color, pero el ring `focus-visible:ring-2` ofrece doble cue. Funciona pero el cambio de border crea micro-shift de 0px. | Input.tsx:24 | Mantener border consistent y solo apoyarse en ring. O poner border a 2px siempre (con margen compensatorio). |
| P2 | Placeholder usa `--ui-text-muted` que en dark da 3.5:1 — borderline para "informational" placeholder. | Input.tsx:21 | OK como esta (placeholder es decorativo) pero documentar. |
| P3 | No hay slot para icon left/right (search icon, currency suffix, etc.) — patron muy comun, probable feature request. | Input.tsx:8-39 | Agregar `prefix?: ReactNode`, `suffix?: ReactNode` con padding ajustado. Decision JP. |
| P4 | `text-base` (16px) en mobile evita zoom iOS — bien hecho — pero `text-base` en label de filtro denso desktop se siente grande. JP Asistant usa varios. | Input.tsx:21 | OK conservar 16px (regla iOS). |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | `transition-colors` default sin token. Drift respecto a DESIGN. | Input.tsx:21 | `transition-[border-color,background-color,box-shadow] duration-[var(--ui-duration-fast)] ease-[var(--ui-ease-out)]`. |
| T2 | Error border no tiene transicion suave — el usuario typed → submit → error aparece "snap". | Input.tsx:23 | Si T1 incluye `border-color`, ya queda. |

## Theme parity (dark vs light)
- Tokens hardcoded? **Si — fallback values en `style` inline** (e.g., `var(--ui-text, #F2F4F3)` — el fallback es el hex de dark theme; en light fallaria si tokens no se cargan).
- Funciona en light theme? **Parcial** — los fallbacks pueden ganar a los tokens en algun corner case (especificidad de inline style).
- Issue especifico de light: el fallback `var(--ui-text, #F2F4F3)` da texto blanco en input — si tokens no cargan en light, input ilegible.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (label htmlFor + useId)
  - C2 (aria-invalid + aria-describedby)
  - C3 + C4 (label sentence case + text-sm + token color)
  - C5 (disabled state)
  - T1 (transition con tokens)
- **Taste fixes** (require review):
  - C6 (Select custom vs nativo) — decision grande
  - P3 (prefix/suffix slots)
  - Eliminar fallbacks hex en `style` inline (o hacerlos light-aware)
- **Skip** (out of scope):
  - P1 (border 2px) — micro-shift no es bloqueante
  - P2 (placeholder contrast) — decorativo
