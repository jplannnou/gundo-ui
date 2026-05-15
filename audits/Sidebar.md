# Audit — Sidebar

**Fecha**: 2026-04-30
**Source**: src/Sidebar.tsx (LOC: 194)

## Fortalezas
- Compound completo: `Sidebar` / `Header` / `Content` / `Footer` / `Group` / `Item` / `Toggle`.
- Controlled + uncontrolled patterns (`controlledCollapsed` ?? `internalCollapsed`).
- `Item` polimorfico via `href` -> `<a>`, sino `<button>`.
- `aria-current="page"` cuando active.
- Title attribute en items collapsed (browser tooltip de label).
- `<nav>` semantico en `SidebarContent`.
- Smooth width transition.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Default context tiene `toggle: () => {}` y `setCollapsed: () => {}` no-ops — si un sub-component se usa fuera de Sidebar, falla silente. Otros compounds (AppShell) tiran error. | Sidebar.tsx:13-17 | Cambiar a `null` + guard error en `useSidebar`, igual que AppShell. |
| C2 | `SidebarItem` collapsed muestra solo icon, pero el `<span class="truncate">label</span>` no se renderiza — el label sigue en el title attribute (browser tooltip). Para SR: NO hay aria-label, asi que SR anuncia solo el icon (que es `aria-hidden`). **Item completamente invisible a SR cuando collapsed.** | Sidebar.tsx:153-155 | Cuando `collapsed`, agregar `aria-label={label}` al `<a>` o `<button>`. |
| C3 | `title` (browser tooltip) NO es accesible a SR ni keyboard users — es solo mouse hover. | Sidebar.tsx:161, 170 | Para teclado/SR, depender de `aria-label` (fix C2) y considerar `<Tooltip>` real cuando collapsed. |
| C4 | `transition-[width]` en aside cambia width pero los children con `<span class="truncate">` colapsan abruptamente. Esto se nota — el text salta. | Sidebar.tsx:61 | Usar `transition-[width,padding]` y wrap label en motion span con opacity transition. |
| C5 | `SidebarToggle` sin `focus-visible` styles — falla focus visibility. | Sidebar.tsx:177-193 | Agregar `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]`. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Group label `text-[10px]` — fuera del scale. Anti-pattern uppercase tracking-wider. | Sidebar.tsx:121-123 | `text-xs font-semibold` sentence case (segun DESIGN.md:181 anti-pattern explicito). |
| P2 | `--ui-text-muted` (3.5:1) en `text-[10px]` — failing AA. | Sidebar.tsx:121-123 | Cambiar a `--ui-text-secondary`. |
| P3 | Active item usa `bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]` — bien, pero contrast del text-primary `--ui-primary` (#67C728) sobre `--ui-primary-soft` (rgba 0.15) sobre dark `#292E37` puede ser borderline en 14px. Calculo: ~4.6:1. AA OK. | Sidebar.tsx:147 | OK. |
| P4 | No hay indicator visual extra para active (left bar/border) — solo tinted bg. Algunos design systems lo refuerzan. | Sidebar.tsx:142-149 | Decision JP: agregar `border-l-2 border-primary` opcional. |
| P5 | `space-y-0.5` (2px) entre items — denso, OK para sidebar tecnico. | Sidebar.tsx:126 | OK. |
| P6 | Padding top/bottom items inconsistente con padding lateral del Group: Item `px-3 py-2`, Group `px-2 py-1` — items casi tocan el border del Group. | Sidebar.tsx:120, 145 | Coherencia: `Group p-2` o ajustar items. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | `transition-[width] duration-200` sin token. | Sidebar.tsx:61 | `duration-[var(--ui-duration-normal)] ease-[var(--ui-ease-in-out)]`. |
| T2 | Item color/bg transition `transition-colors` default Tailwind — drift. | Sidebar.tsx:145 | `transition-[color,background-color] duration-[var(--ui-duration-fast)]`. |
| T3 | Collapsed/expanded swap del icono (PanelLeftClose vs PanelLeftOpen) snap — Emil pattern: rotation animation o crossfade. | Sidebar.tsx:185-191 | Wrap con AnimatePresence o use `motion.div` con rotate. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si.**
- Issue light: el `bg-[var(--ui-surface)]` del aside igual al main — sin diferenciacion (mismo problema que AppShell header).

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (context error guard)
  - C2 (aria-label cuando collapsed)
  - C5 (focus-visible en SidebarToggle)
  - P1 + P2 (label sentence case + text-xs + secondary)
  - T1 + T2 (transition tokens)
- **Taste fixes** (require review):
  - C3 (Tooltip real cuando collapsed)
  - C4 (animation label collapse)
  - P4 (active indicator border)
  - P6 (padding coherencia)
  - T3 (icon swap animation)
- **Skip** (out of scope):
  - P3, P5 — no hay drift critico
