# Audit — EmptyState

**Fecha**: 2026-04-30
**Source**: src/EmptyState.tsx (LOC: 32)

## Fortalezas
- API minima y polimorfica (`action` ReactNode o `actionLabel`+`onAction`).
- Estructura coherente: icon -> title -> description -> action.
- Centrado vertical + padding generoso `py-16` para layout limpio.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Action button inline duplica logica de Button — drift respecto al Button component. Ademas usa `text-white` (anti-pattern DESIGN.md:183). | EmptyState.tsx:14-21 | Importar `Button` del propio lib y reusar: `<Button onClick={onAction}>{actionLabel}</Button>`. Elimina drift. |
| C2 | Title usa `text-lg font-medium text-[var(--ui-text-secondary)]` — pero el title es el elemento visual mas importante. Color secondary lo desjerarquiza. | EmptyState.tsx:26 | Cambiar a `text-[var(--ui-text)]`. Description queda en secondary (correcto). |
| C3 | Description con `--ui-text-muted` en `text-sm` (14px) — falla AA (3.5:1). | EmptyState.tsx:27 | Cambiar a `--ui-text-secondary`. |
| C4 | Icon `text-[var(--ui-text-muted)]` — para un icono decorativo grande puede estar OK, pero si el icono es funcional/informativo se diluye. | EmptyState.tsx:25 | Documentar: para iconos decorativos, OK. Sino, override via `iconClassName?`. |
| C5 | Sin `role="status"` o landmark — un EmptyState que aparece tras filter return = empty no se anuncia. | EmptyState.tsx:23 | `role="status"` opcional o `aria-live="polite"`. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Title como `<p>` no es heading semantico — pierde jerarquia outline. | EmptyState.tsx:26 | Considerar prop `headingLevel?: 2 | 3 | 4` para renderizar `<h{level}>`. |
| P2 | `py-16` (64px) hardcoded — bien para un pagina full-empty, pero embeded dentro de un Card con padding propio puede sentirse excesivo. | EmptyState.tsx:24 | Prop `compact?: boolean` -> `py-8`. |
| P3 | Icon container `mb-4` (16px) — apropiado. | EmptyState.tsx:25 | OK. |
| P4 | Sin slot `illustration` opcional para usar `EmptyStateIllustration` mencionado en CLAUDE.md inventory — puede ser otro componente separado, no audit aqui. | EmptyState.tsx:25 | Verificar si `EmptyStateIllustration` ya cubre esa necesidad. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Sin animation enter — un empty state que aparece tras filter sin data podria fade-in sutil. Decision: subjetiva. | EmptyState.tsx:23 | Decision JP: motion opcional via wrapper. |
| T2 | Icon `mb-4` `text-muted` da color casi gris — Emil pattern: o usar el icono con color de brand muted (`--ui-primary` con baja opacity), o duotone. | EmptyState.tsx:25 | Considerar `text-[var(--ui-text-secondary)]` para mas vida sin dominar. |

## Theme parity (dark vs light)
- Tokens hardcoded? **Si** — `text-white` en action button.
- Funciona en light theme? **Parcial** — mismo issue que C1.
- Issue especifico de light: si Button del lib se reusa (fix C1), light theme funciona auto.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (reusar Button del lib)
  - C2 (title -> text)
  - C3 (description -> secondary)
  - T2 (icon color secondary)
- **Taste fixes** (require review):
  - C5 (role status)
  - P1 (heading semantico configurable)
  - P2 (compact variant)
- **Skip** (out of scope):
  - C4, P3, P4, T1 — no hay drift critico
