# Audit — Toast + ToastProvider

**Fecha**: 2026-04-30
**Source**: src/Toast.tsx (LOC: 70), src/ToastProvider.tsx (LOC: 126)

---

## Toast (single)

### Fortalezas
- 4 tipos con icono Lucide propio.
- Pause-on-hover (paused state) — UX correcto para que usuario lea.
- `role="alert"`, `aria-live="polite"`, `aria-atomic="true"` — bien.
- Icon con stroke 2.5 — bold y legible.
- Border circular alrededor del icon (5x5 rounded-full) — pattern visual distintivo.
- Children text usa `--ui-text` (no el tinted color) — readability sobre soft bg.

### Issues criticos
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | `role="alert"` + `aria-live="polite"` — `alert` ya implica `assertive`. Conflicto: el navegador puede pickear cualquiera, screen reader no consistente. | Toast.tsx:42-43 | Usar `role="status"` con `aria-live="polite"` para info/success, `role="alert"` (sin aria-live) para error/warning. |
| C2 | El timer usa `setTimeout` y se resetea al pause/resume — pero el tiempo restante NO se preserva. Si pauseas 3s y reanudas, el timer arranca desde 0 nuevamente (4s). | Toast.tsx:32-36 | Trackear `remainingTime` con startTime ref, decrementar al pause. |
| C3 | Dismiss button sin `focus-visible:` styles — falla focus visibility. | Toast.tsx:57-66 | Agregar `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]`. |

### Polish / Taste
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Inline `style` para bg/border/color — funciona pero menos performante que clases. Tradeoff por dinamicidad de los typeStyles. | Toast.tsx:46 | OK (los estilos son value-driven, justificable). |
| P2 | Padding `px-5 py-3` (20px / 12px) — `py-3` esta en el scale (`--ui-space-3`), `px-5` no esta (entre 4 y 6). Drift menor. | Toast.tsx:45 | `px-4` (16px) o `px-6` (24px). |
| P3 | `shadow-lg` Tailwind (no token) — drift. | Toast.tsx:45 | `shadow-[var(--ui-shadow-lg)]`. |
| P4 | No hay accion slot (e.g., "Undo" en error toast). | Toast.tsx:7-13 | Agregar `action?: { label: string; onClick: () => void }`. |

### Theme parity
- Tokens hardcoded? **No** (excepto `shadow-lg` Tailwind class).
- Light theme: funciona — soft bgs y border via tokens.

---

## ToastProvider

### Fortalezas
- 6 positions, configurable.
- `maxToasts` cap.
- AnimatePresence con `layout` prop para reflow suave.
- Slide direction calculado por position (top vs bottom).
- `pointer-events: none` en container, `auto` en cada toast — correcto para no bloquear app.
- Counter monotonico para IDs (no UUIDs por overhead).

### Issues criticos
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Counter `let counter = 0` global module-level — si el modulo se hot-reloadea o el provider se monta multiples veces, ID collision posible. | ToastProvider.tsx:43 | Usar `useRef(0)` dentro del provider. |
| C2 | `z-[100]` hardcoded — design system tiene `--ui-z-toast: 600`. Drift critico. | ToastProvider.tsx:98 | `z-[var(--ui-z-toast)]`. |
| C3 | `dismissAll` se expone via context pero nunca se llama internamente — caso desconectado del provider. Bien (consumer-driven). | ToastProvider.tsx:56-58 | OK. |
| C4 | `setToasts(prev => [...prev.slice(-(maxToasts - 1)), item])` — slice recorta del frente correctamente, pero si `maxToasts` cambia mid-flight, comportamiento raro. Edge case minimo. | ToastProvider.tsx:68 | OK. |

### Polish / Taste
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Animation duration 0.2s + ease `[0,0,0.2,1]` (ease-out) — coherente con DESIGN.md tokens, aunque hardcoded en numero. | ToastProvider.tsx:109 | Idealmente leer `--ui-duration-normal` y `--ui-ease-out` (Motion lo soporta via `var()` en algunos casos). Decision: dejar valores numericos por simplicidad de Motion. |
| P2 | No hay swipe-to-dismiss (mobile pattern). | ToastProvider.tsx:101-122 | Decision JP: con Motion `<motion.div drag="x" onDragEnd={...}>`. |
| P3 | Stacking direction depende de position — top stacks down, bottom stacks up — patron correcto. | ToastProvider.tsx:101-122 | OK. |
| P4 | `maxWidth: '420px'` hardcoded en style — funciona pero podria ser var. | ToastProvider.tsx:99 | `maxWidth: 'var(--ui-toast-max-width, 420px)'`. |

### Taste / motion (Emil)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Layout transition entre toasts via `layout` prop de Motion — correcto, da reflow suave cuando uno se va. | ToastProvider.tsx:104 | OK. |
| T2 | El scale 0.95 en initial/exit ademas de y/opacity — combina 3 propiedades. Emil pattern: simplificar a 2 (opacity + slight y). | ToastProvider.tsx:106-108 | Decision: sacar scale, o sacar `y` translation. |

### Theme parity
- Funciona en light? **Si.**
- Issue light: shadow `shadow-lg` (Tailwind) es suave, bien.

---

## Recommended PR scope (combinado)

### Safe fixes (auto-merge)
- Toast C1 (separar `role="alert"` vs `role="status"`)
- Toast C3 (focus-visible en dismiss)
- Toast P3 (`shadow-[var(--ui-shadow-lg)]`)
- ToastProvider C1 (counter via useRef)
- ToastProvider C2 (`z-[var(--ui-z-toast)]`)
- Toast P2 (`px-5` -> `px-4`/`px-6`)

### Taste fixes (require review)
- Toast C2 (preserve remainingTime al pause/resume)
- Toast P4 (action slot)
- ToastProvider P2 (swipe-to-dismiss)
- ToastProvider P4 (maxWidth var)
- ToastProvider T2 (simplificar animation a 2 axes)

### Skip
- Toast P1 (inline style por dinamicidad — OK)
- ToastProvider C3, C4, P1, P3, T1 — no hay drift
