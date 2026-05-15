# Audit — Tooltip

**Fecha**: 2026-04-30
**Source**: src/Tooltip.tsx (LOC: 68)

## Fortalezas
- 4 positions con classes correctas.
- Arrow rendered con border-tricks — no SVG extra.
- `aria-describedby` cuando visible.
- `role="tooltip"`.
- `useReducedMotion` respetado.
- Show on focus/hover, hide on blur/mouseleave.
- `tabIndex={0}` en wrapper para keyboard accessibility.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | `tabIndex={0}` en el `<span>` wrapper — si el children ES un `<button>` ya tabbable, el wrapper se vuelve un focus stop extra (doble Tab). | Tooltip.tsx:41 | Quitar `tabIndex={0}` y delegar al children. Alternativa: Radix-style con `Slot`/`asChild`. O detectar si children es focuseable. |
| C2 | Hover delay = 0 — tooltip aparece instant, comportamiento "twitchy" si el cursor pasa por encima. WCAG 1.4.13 sugiere "dismissible, hoverable, persistent" — necesita delay de show (~500ms typical). | Tooltip.tsx:31-32 | Agregar `delayDuration?: number` (default ~500ms para show, 0 para hide). |
| C3 | Tooltip no es "hoverable" — si usuario hace hover sobre el tooltip mismo (no el trigger), se pierde porque `onMouseLeave` del wrapper dispara hide. Limita user que necesite leer despacio. | Tooltip.tsx:37-38 | Implementar logic con `setTimeout` cancelable para permitir hover sobre tooltip. |
| C4 | No `Escape` key handler para cerrar tooltip persistente — WCAG 1.4.13 requiere "dismissible". | Tooltip.tsx:34 | Agregar `useEffect` con `keydown` listener para Escape. |
| C5 | Tooltip puede overflowar viewport en bordes — no hay collision detection. En mobile especialmente. | Tooltip.tsx:17-22 | Idealmente Floating UI / Radix Popover. Decision JP: si la lib se mantiene custom, agregar viewport-aware logic minima o switch a `<Popover>` ya existente. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Background `bg-[var(--ui-surface)]` — mismo que app background. En oscuridad puro carbon-on-charcoal apenas se distingue del fondo. Tooltips suelen ser "elevated surface" (raised). | Tooltip.tsx:59 | Cambiar a `bg-[var(--ui-surface-raised)]` o introducir `--ui-tooltip-bg` token. |
| P2 | Arrow color matched al `--ui-surface` — invisible en mismo bg. | Tooltip.tsx:25-28 | Si P1, ajustar arrow a `--ui-surface-raised`. |
| P3 | `text-xs` (12px) tooltip text + `--ui-text` color = OK para size, pero podria sentir denso. Tooltips estandar: 13-14px. | Tooltip.tsx:59 | `text-sm` (14px) + `whitespace-nowrap` ya esta. |
| P4 | `max-w-xs` (320px) max width — bien para texto largo. | Tooltip.tsx:57 | OK. |
| P5 | Animacion `easeOut` (string) — Tailwind/Motion easing. Drift respecto tokens. | Tooltip.tsx:55 | `ease: [0, 0, 0.2, 1]` (matching tokens). |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Initial scale `0.95` + opacity 0 — bien, sutil. Duration 0.15s rapido. | Tooltip.tsx:50-52 | OK. |
| T2 | Tooltip aparece SIN delay — Emil + Raycast pattern: tooltips son unforgiving si aparecen al primer hover. Necesitan ~400-700ms delay. | Tooltip.tsx:31 | Ya cubierto en C2. |
| T3 | El `whitespace-nowrap` outer + `whitespace-normal` inner — funcional, pero la transicion de width cuando text wrappea es snap. | Tooltip.tsx:57, 59 | OK (text es estatico, no cambia size en runtime). |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si**, pero issue P1 — bg surface light (`#F2F4F3`) es el mismo que app bg en light. Tooltip se mimetiza con fondo.
- Issue critico de light: si P1 no se fixea, en light tooltip se ve como text flotante sin container visible — completamente roto visualmente.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C2 (`delayDuration` prop, default 500ms)
  - C4 (Escape handler)
  - P1 + P2 (`--ui-surface-raised` para bg + arrow)
  - P5 (easing token)
- **Taste fixes** (require review):
  - C1 (eliminar doble tabIndex / asChild pattern)
  - C3 (hoverable tooltip)
  - C5 (collision detection — decision: switch a Popover/Floating UI)
  - P3 (text size sm vs xs)
- **Skip** (out of scope):
  - P4, T1, T3 — no hay drift
