# Audit — AlertBanner

**Fecha**: 2026-04-30
**Source**: src/AlertBanner.tsx (LOC: 38)

## Fortalezas
- 4 tipos semanticos coherentes (error/warning/info/success).
- Usa `*-soft` + `*` border + `*` text — patron design coherente.
- Dismiss button con aria-label.
- Optional title con margen apropiado.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Sin `role="alert"` ni `aria-live` — un AlertBanner que aparece dinamicamente NO es anunciado por SR. Caso #1 fallo de accesibilidad de banners. | AlertBanner.tsx:22-23 | Agregar `role="alert"` para errors/warnings, `role="status"` para info/success. O `aria-live="polite"` parametrizable. |
| C2 | `text-[var(--ui-warning)]` sobre `bg-[var(--ui-warning-soft)]` con border `--ui-warning` — en text-sm (14px) el contrast en light theme `#92400e` sobre `rgba(146,64,14,0.1)` con surface light **falla AA borderline 4.0:1**. Documentado en theme.css. En dark con `#f59e0b` sobre dark+soft = ~3.7:1 falla. | AlertBanner.tsx:14-19 | Para banner usar `--ui-text` (no el tinted color) con icon coloreado. Mismo patron que Toast actual donde span text usa `--ui-text`. |
| C3 | NO hay icon contextual (alert sin Info/AlertTriangle/CheckCircle/XCircle) — solo color comunica. Falla principio "no usar solo color" (WCAG 1.4.1). | AlertBanner.tsx:21-37 | Agregar icon Lucide por tipo (AlertCircle, AlertTriangle, Info, CheckCircle). Mismo set que Toast. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Border de 1px del color `--ui-warning`/`--ui-error` etc. + el bg `*-soft` — el border puede sentirse harsh en el tono base saturado. Toast usa misma estrategia y se ve OK por el card-feel. | AlertBanner.tsx:23 | OK como esta, pero podria probar `border-l-4` (left accent stripe) pattern para banners (Stripe, Material design). |
| P2 | Sin variation `density` — banners para errores criticos vs banners de info son visualmente identicos. | AlertBanner.tsx:6-12 | Decision JP: no urgente. |
| P3 | `font-medium mb-1` en title — apropiado. | AlertBanner.tsx:26 | OK. |
| P4 | Children sin estilos por defecto — si el consumer pasa un `<p>` con styles diferentes, drift visual. | AlertBanner.tsx:27 | OK confiar en consumer. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | AlertBanner no tiene enter/exit animation — aparece "snap". Para feedback dinamico (error de form, info temporal), un fade-in + slight slide es esperable. | AlertBanner.tsx:21 | Wrap con AnimatePresence opcional, o documentar pattern (`<motion.div>`). |
| T2 | Dismiss button es `opacity-70` -> `opacity-100` on hover — bien. Pero el icono X en color del banner mismo (`--ui-warning` etc.) — podria perderse. | AlertBanner.tsx:30-32 | OK. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Parcial** — issue C2 con warning text en small.
- Issue especifico de light: warning soft `rgba(146,64,14,0.1)` sobre `#F2F4F3` da fondo casi imperceptible, pero el text `#92400e` es legible. El border `#92400e` 1px puede ser muy oscuro/dominante.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (`role="alert"` / `role="status"`)
  - C3 (icon Lucide por tipo)
  - C2 (text-[var(--ui-text)] + icon coloreado pattern)
- **Taste fixes** (require review):
  - P1 (left accent stripe variant)
  - T1 (motion opcional)
- **Skip** (out of scope):
  - P2, P4, T2 — no hay drift
