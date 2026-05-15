# Audit — Badge

**Fecha**: 2026-04-30
**Source**: src/Badge.tsx (LOC: 40)

## Fortalezas
- API expresiva: 9 variants, 2 sizes, `dot`, `icon` slot.
- Soft variants en todos los semanticos — coherente con DESIGN.md.
- `purple` mapea a `--ui-tertiary` (correcto, es teal — gotcha documentada en CLAUDE.md).
- Usa tokens, sin hex hardcodeado.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | `--ui-warning` (#f59e0b) usado como text en `warning` variant sobre `--ui-warning-soft` — en light theme `--ui-warning` cambia a `#92400e` (correcto), pero en dark theme `#f59e0b sobre rgb(245,158,11,0.15)` da contraste **~3.8:1 sobre #292E37 fondo** — falla AA en text-xs (12px). Documentado en theme.css:34 ("falla AA en light theme") pero el problema esta tambien en dark. | Badge.tsx:18 | Para dark theme, deeper `--ui-warning-soft` y mantener text. O usar `--ui-text` con icon-only color. Decision JP. |
| C2 | `--ui-info` (#60a5fa actual en theme.css:55) sobre soft (`rgb(96,165,250,0.15)`) en dark theme da contraste ~4.0:1 — borderline AA en text-xs. | Badge.tsx:19 | Mismo patron — el badge soft pattern necesita validation contrastiva por size. |
| C3 | Badge con icon o dot pero solo numero ("3") como children — para SR no hay context ("3 que?"). | Badge.tsx:31-38 | Documentar que children debe ser legible solo, o agregar prop `aria-label` opcional. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Tamaño `sm` con `text-xs` (12px) cae bajo "minimo 14px body" — pero los badges suelen ser textuales cortos, OK como excepcion. | Badge.tsx:27 | OK pero documentar excepcion. |
| P2 | `dot` `w-1.5 h-1.5` (6px) — tipico StatusDot inline. Bien. | Badge.tsx:34 | OK. |
| P3 | No hay variant `brand` (primary green soft) — solo via clase custom. Patron comun "destacar algo no semantico". | Badge.tsx:14 | Agregar `brand` variant -> `bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]`. |
| P4 | `outline` variant tiene border 1px sin padding compensation — el ancho total del badge difiere ~2px de los soft variants. Drift sutil de alineacion en grids. | Badge.tsx:23 | `box-sizing: border-box` ya esta por default tailwind, pero el ancho visual cambia. Aceptable. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Sin transitions — Badge es estatico. OK para badge, pero si se usa con `dot` para "live status" (e.g., online/offline), un fade entre estados seria nice. | Badge.tsx:31-38 | Decision JP: si Badge es interactive (raro), agregar transition. |
| T2 | `font-medium` (500) en text-xs — bien legible, no hay issue. | Badge.tsx:33 | OK. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si** mayormente, salvo issues C1/C2 de contraste warning/info.
- Issue especifico de light:
  - `warning` light usa `#92400e` (oscuro) sobre `rgb(146,64,14,0.1)` — buen contraste en light.
  - `info` light usa `#2563eb` sobre `rgb(37,99,235,0.1)` — OK.
  - El problema real es **dark theme** con info y warning.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - P3 (agregar `brand` variant)
  - C3 (documentar a11y o agregar `aria-label?`)
- **Taste fixes** (require review):
  - C1 + C2 (warning/info contrast en dark — requiere ajustar tokens, no Badge — se decide globalmente)
- **Skip** (out of scope):
  - P1, P2, P4, T1, T2 — no hay drift significativo
