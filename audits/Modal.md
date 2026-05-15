# Audit — Modal

**Fecha**: 2026-04-30
**Source**: src/Modal.tsx (LOC: 99)

## Fortalezas
- `useFocusTrap` integrado, `previousFocusRef` para volver al disparador — comportamiento profesional.
- Escape key handler + click backdrop cierran.
- `aria-labelledby` cuando hay title, `aria-modal`, `role="dialog"` correctos.
- `useReducedMotion` respetado — exit animations skippeadas.
- `max-h-[90dvh]` con scroll overflow — funciona en mobile bars.
- 4 sizes con `max-w-*` apropiados.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Sin `title`, NO hay `aria-label` ni `aria-labelledby` — modal sin nombre accesible. **Falla WCAG 4.1.2.** | Modal.tsx:70 | Si no hay title, requerir prop `aria-label` (TypeScript) o fallback. |
| C2 | Body scroll NO esta lockeado — pagina detras hace scroll mientras modal abre, especialmente sobre touchpads/mobile. | Modal.tsx:34-48 | En el effect, agregar `document.body.style.overflow = 'hidden'` y restaurar en cleanup. |
| C3 | Modal usa `z-50` hardcoded en backdrop — no usa `--ui-z-modal` (500). Si se anida con CommandPalette (550), z-index incorrecto. | Modal.tsx:61 | `z-[var(--ui-z-modal)]`. |
| C4 | `useEffect` cleanup hace `previousFocusRef.current?.focus()` SIEMPRE, incluso si el component se unmount con el modal abierto — puede mover foco a sitio raro si el disparador ya no existe. | Modal.tsx:46 | Agregar guard `if (open) previousFocusRef.current?.focus()` o mover restore al `exit` de AnimatePresence. |
| C5 | Click backdrop usa `e.target === e.currentTarget` — funciona, pero un drag desde dentro del modal hacia afuera (mouseup en backdrop) cierra el modal. Mala UX en forms. | Modal.tsx:62 | Trackear `mousedown` solo en backdrop (no via target check sobre click). |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Backdrop `backdrop-blur-sm` siempre — bonito en dark, pero en light theme + windowless puede sentir over-the-top. | Modal.tsx:61 | OK; dejar consistente. |
| P2 | Animation `y: 10` (modal entra desde abajo) + `scale: 0.95` — funcional, pero el `y` se siente low-effort. Emil pattern: o solo scale, o solo translateY mas pronunciado. | Modal.tsx:72-74 | Decidir un movimiento dominante: o scale `0.96 -> 1`, o `y: 8 -> 0`, no ambos al mismo tiempo. |
| P3 | Title usa `text-lg font-semibold` — apropiado para md/lg modal, pero en `size='xl'` (max-w-4xl) se ve chico relativo al ancho. | Modal.tsx:81 | Considerar `text-xl` cuando size es lg/xl. |
| P4 | Close button (X) `p-2` con icon `h-5 w-5` — area de toque OK. Posicion top-right requiere `mb-4` que solo existe si hay title — sin title no hay close button visible. | Modal.tsx:79-91 | Si no hay title, igual mostrar un close button absoluto top-right. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Easing `[0, 0, 0.2, 1]` (ease-out) bien para enter, pero exit usa la misma — Emil prefiere `easeIn` para exit. Aca estan ambos en mismo curve. | Modal.tsx:75 | Diferentes easings para enter vs exit, o dejar `ease-out` (decision). |
| T2 | Duration 0.2s — corto pero apropiado para un dialog. No issue. | Modal.tsx:50 | OK. |
| T3 | Backdrop fade-in (opacity 0 -> 1) en 0.2s sin stagger del content — siente un "flop" simultaneo. Emil pattern: backdrop entra ligeramente antes (0.05s delay para content). | Modal.tsx:55-75 | `transition: { delay: 0.05 }` en motion.div content para crear un sutil layered entry. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si** — `--ui-overlay` se ajusta (0.6 dark, 0.3 light), backgrounds via tokens.
- Issue especifico de light: shadow `shadow-2xl` (Tailwind default) podria sentirse demasiado fuerte sobre fondo light. Considerar `shadow-[var(--ui-shadow-lg)]` para consistencia con tokens.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (require aria-label si no title) + tipo TypeScript
  - C2 (body scroll lock)
  - C3 (z-index token)
  - C4 (focus restore guard)
- **Taste fixes** (require review):
  - C5 (mousedown vs click on backdrop) — fix UX importante pero require care
  - P2 (animation single-axis)
  - T3 (stagger backdrop/content)
  - shadow-2xl -> shadow-lg token
- **Skip** (out of scope):
  - P3 (title size dynamic)
  - P4 (close button without title) — feature request
