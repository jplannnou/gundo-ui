# Audit — AppShell

**Fecha**: 2026-04-30
**Source**: src/AppShell.tsx (LOC: 97)

## Fortalezas
- Compound pattern (`AppShell` / `AppShellHeader` / `AppShellMain`) limpio.
- Context para mobile drawer state + `useAppShell` hook con guard error.
- Mobile-first: hidden sidebar en `lg:` breakpoint + overlay drawer.
- Z-index via tokens (`--ui-z-overlay`, `--ui-z-modal`).
- `aria-label="Toggle navigation"` en hamburger.
- Header fixed via flex + `shrink-0`.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Mobile drawer abierto NO trapea focus — usuario con teclado puede tabbear "fuera" del drawer hacia el main content invisible. | AppShell.tsx:78-88 | Usar `useFocusTrap` (ya existe en lib) cuando `mobileOpen`. |
| C2 | Drawer no cierra con `Escape` — falla pattern estandar de modales/drawers. | AppShell.tsx:67-97 | Agregar `useEffect` con keydown handler cuando `mobileOpen`. |
| C3 | Drawer mobile NO tiene `role="dialog"` ni `aria-modal="true"` ni nombre accesible. SR reads as plain `<aside>`. | AppShell.tsx:85-87 | Agregar atributos ARIA cuando es overlay mode. |
| C4 | Header no es `<nav>` — es un wrapper `<header>` correcto, pero el children-passing no enfatiza navigation landmark. | AppShell.tsx:46-58 | OK como esta — el consumer pasa el `<nav>` dentro. |
| C5 | `bg-[var(--ui-surface)]` igual que main bg — el header no se diferencia visualmente del main scrolleado. | AppShell.tsx:47 | `bg-[var(--ui-surface-raised)]` o agregar `backdrop-blur-md` cuando hay scroll. |
| C6 | No hay "skip to main content" link — accesibilidad pattern estandar para mantener navigation skipeable. | AppShell.tsx:46-58 | Agregar `<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>` al inicio del header. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | `h-14` (56px) header — apropiado, pero rigido. Algunos consumers podrian querer 48 o 64. | AppShell.tsx:47 | OK por default; documentar override via className. |
| P2 | Hamburger `p-1.5` (6px) — area de toque ~44x44 borderline. WCAG AAA es 44x44, AA 24x24. OK. | AppShell.tsx:51 | OK. |
| P3 | `rounded-[var(--ui-radius-md)]` mixto con la sintaxis — funciona pero deberia ser consistente con resto del componente que usa `rounded-md`. | AppShell.tsx:51 | OK consistencia. |
| P4 | Mobile drawer width fijo `w-64` (256px) — en mobile mas chico (320px) deja `64px` de overlay. OK. | AppShell.tsx:85 | OK. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Drawer mobile aparece sin animation — sin slide-in. Mal UX. | AppShell.tsx:85-87 | Wrap con AnimatePresence + slide from left. Igual que Modal pattern. |
| T2 | Overlay (backdrop) aparece sin fade — snap. | AppShell.tsx:80-84 | Agregar fade in/out. |
| T3 | Hamburger button click sin transition — color hover snap. | AppShell.tsx:50-55 | `transition-colors` con tokens. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si.**
- Issue light: header `bg-[var(--ui-surface)]` (`#F2F4F3`) sobre body `--ui-surface` mismo — sin diferenciacion. Mismo issue C5.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (focus trap en drawer)
  - C2 (Escape close)
  - C3 (role dialog + aria-modal cuando overlay)
  - C5 (header surface-raised)
  - C6 (skip-to-content link)
  - T1 + T2 (motion drawer + backdrop)
  - T3 (transition hamburger)
- **Taste fixes** (require review):
  - P1 (height customizable) — feature
- **Skip** (out of scope):
  - C4 — no es bug
  - P2, P3, P4 — no hay drift
