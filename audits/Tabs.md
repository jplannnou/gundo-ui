# Audit — Tabs

**Fecha**: 2026-04-30
**Source**: src/Tabs.tsx (LOC: 75)

## Fortalezas
- Roving `tabIndex` correcto (`tabIndex={isActive ? 0 : -1}`) — patron W3C ARIA.
- Keyboard nav completo: ArrowLeft/Right, Home, End.
- `role="tablist"` + `role="tab"` + `aria-selected` correctos.
- `whitespace-nowrap shrink-0` + `overflow-x-auto` — manejan tabs largos en mobile.
- Focus + change combinados — el active tab cambia al moverse con teclado (W3C "automatic activation" pattern, OK para casos sin async load pesado).

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Active tab usa `text-white` hardcoded — viola "nunca pure white" (DESIGN.md:183 anti-pattern). | Tabs.tsx:63 | Cambiar a `text-[var(--ui-surface)]` (igual patron que Button). |
| C2 | Falta `aria-controls` — tab no apunta a su panel correspondiente. SR no salta al panel cuando activas tab. | Tabs.tsx:52-69 | Cada tab necesita `aria-controls={panelId}` y el consumer debe poner `<div role="tabpanel" id={panelId} aria-labelledby={tabId}>`. Documentar uso. |
| C3 | `tab.icon` es `string` (emoji) — limitante. La mayoria de design systems usa icon-as-component. | Tabs.tsx:7 | Cambiar a `icon?: ReactNode` para pasar `<HomeIcon />`. Mantener compat con string emoji. |
| C4 | "Automatic activation" puede ser problema si los panels tienen async data — al pasar Arrow key sobre 5 tabs se disparan 5 fetches. | Tabs.tsx:34-38 | Agregar prop `activationMode?: 'automatic' | 'manual'`. Manual: solo Enter/Space dispara onTabChange. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Active tab solid green (`bg-[var(--ui-primary)]`) sobre `bg-[var(--ui-surface)]` (charcoal) — alta saturacion. Otros design systems (Linear, Vercel) usan tab variant mas sutil (border-bottom indicator). | Tabs.tsx:62-64 | Decision JP: ofrecer `variant?: 'pills' | 'underline'`. Underline = `border-b-2 border-primary` indicador. |
| P2 | Inactive tab usa `text-[var(--ui-text-muted)]` (3.5:1) en `text-sm` — falla AA. | Tabs.tsx:64 | `text-[var(--ui-text-secondary)]`. |
| P3 | Container `bg-[var(--ui-surface)]` igual al app background — el patron pills se pierde si todo es del mismo color. Se ve como tabs flotando. | Tabs.tsx:47 | Cambiar a `bg-[var(--ui-surface-raised)]` para diferenciar. |
| P4 | `overflow-x-auto` en mobile da scroll horizontal sin indicators (no fade gradients en bordes). El usuario no sabe que hay mas tabs. | Tabs.tsx:47 | Agregar pseudo-elements con linear-gradient en bordes (mask-image) o flecha indicators. Decision: optional. |
| P5 | Icon emoji `mr-2` (8px) — cuando tab.icon es ReactNode con SVG h-4 w-4, el spacing puede sentirse desigual. | Tabs.tsx:67 | Cambiar a flex layout: `<span class="inline-flex items-center gap-2">`. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Switch active tab es `transition-all` — anti-pattern (DESIGN.md:185). | Tabs.tsx:61 | `transition-[background-color,color]` con tokens. |
| T2 | Sin "magic moving indicator" — Emil-tier seria un slider que se mueve entre tabs (Vercel, Apple Music style) usando layoutId de Motion. | Tabs.tsx:62 | Decision premium: agregar `<motion.div layoutId="active-tab" />` underneath para shared element transition. |
| T3 | Active tab `font-semibold` (600) — mas peso que inactive (que es default 500 medium). El cambio de weight crea micro-shift en el ancho del tab. | Tabs.tsx:63 | Mantener `font-medium` activos e inactivos, dejar que el bg comunique el state. |

## Theme parity (dark vs light)
- Tokens hardcoded? **Si** — `text-white` en active tab.
- Funciona en light theme? **Parcial** — el `text-white` sobre `--ui-primary` light (`#08563E` verde oscuro) da AAA, pero rompe la regla. En light el container `bg-[var(--ui-surface)]` (#F2F4F3) y los hovers funcionan.
- Issue especifico de light: el contrast del muted en light (`#57606a` 5.0:1 ya documented) pasa.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (text-white -> text-[var(--ui-surface)])
  - P2 (muted -> secondary)
  - P3 (container surface-raised)
  - T1 (eliminar transition-all)
  - T3 (font-medium consistente)
- **Taste fixes** (require review):
  - C2 (aria-controls + tabpanel pattern, requiere doc + posible Tabs.Panel componente)
  - C3 (icon ReactNode, breaking minor)
  - C4 (activation mode prop)
  - P1 (variant pills | underline)
  - T2 (layoutId magic indicator)
- **Skip** (out of scope):
  - P4 (scroll indicators) — feature creep
  - P5 (mejor con C3 resuelto)
