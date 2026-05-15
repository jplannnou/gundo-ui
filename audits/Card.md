# Audit — Card

**Fecha**: 2026-04-30
**Source**: src/Card.tsx (LOC: 42)

## Fortalezas
- API minima y predecible: `hover`, `padding`, `onClick`. Sin gold-plating.
- Auto-detecta interactividad (`isInteractive = hover || !!onClick`) — DX limpia.
- Keyboard activation (`Enter`/`Space`) cuando hay `onClick`.
- Usa tokens (`--ui-border`, `--ui-surface-raised`, `--ui-surface-hover`).

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Card con `onClick` (interactive) NO tiene focus ring visible — `tabIndex={0}` lo hace focuseable pero no hay clase `focus-visible:ring-*`. Falla WCAG 2.4.7. | Card.tsx:20-25 | Agregar `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)]` cuando `isInteractive`. |
| C2 | `role="button"` + click handler swallows children semantics — si el card contiene un `<a>` o `<button>` interno, screen reader anuncia "button" outer y los inner pierden contexto. Anti-pattern accesibilidad ARIA. | Card.tsx:27 | Documentar regla: NO anidar interactive within Card-as-button. Idealmente, separar `Card` (presentational) y `CardButton` (semantic button wrapper). Decision JP. |
| C3 | `onKeyDown` cast `as never` para forzar tipos — funcional pero suprime el type checking de eventos. Si llega un Enter desde un nested input, dispara onClick padre. | Card.tsx:32 | Agregar `e.target === e.currentTarget` guard ANTES de invocar `onClick`. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | `hover:-translate-y-0.5` (2px) sin shadow boost — siente flotante sin elevation cue. Emil pattern: hover lift = +shadow + translateY juntos. | Card.tsx:24 | Agregar `hover:shadow-[var(--ui-shadow-md)]` para reforzar el lift. |
| P2 | `transition-all duration-200` — el design system explicita "no `transition-all`" (anti-pattern listed en DESIGN.md:185). | Card.tsx:24 | `transition-[transform,background-color,box-shadow] duration-[var(--ui-duration-normal)] ease-[var(--ui-ease-out)]`. |
| P3 | `padding=true` da `p-6` (24px) hardcoded — el sistema tiene `--ui-space-6`. Drift menor. | Card.tsx:22 | Migrar a `p-[var(--ui-spacing-6)]` o exponer prop `padding: 'sm' | 'md' | 'lg' | false`. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | El lift de `2px` es timido — Emil suele animar `4px` con curva spring. 2px puede sentir "casi nada". | Card.tsx:24 | `hover:-translate-y-1` (4px) o spring via Motion lib. JP debe decidir si Card amerita Motion. |
| T2 | No hay `active:` state — al hacer click la Card no responde haptico. | Card.tsx:24 | `active:translate-y-0 active:shadow-[var(--ui-shadow-sm)]`. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si** — `--ui-surface-raised` cambia a `rgb(0 0 0 / 0.02)` apropiadamente, `--ui-border` invierte.
- Issue especifico de light: la diferencia entre `--ui-surface-raised` (0.02) y `--ui-surface` light (`#F2F4F3`) es muy sutil — Card on light theme casi desaparece sobre fondo. Considerar boost a `0.04` en light o un `border` mas visible.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (focus ring visible)
  - C3 (target guard en onKeyDown)
  - P2 (eliminar `transition-all`)
- **Taste fixes** (require review):
  - C2 (decision arquitectonica: Card vs CardButton split)
  - P1 (shadow on hover)
  - T1 (translate amount)
  - T2 (active state)
  - Boost de `--ui-surface-raised` en light theme
- **Skip** (out of scope):
  - P3 (padding sizes) — feature, no fix
