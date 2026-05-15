# Audit — KpiCard

**Fecha**: 2026-04-30
**Source**: src/KpiCard.tsx (LOC: 108)

## Fortalezas
- API muy completa: `title`/`label` aliasing, `trend` polimorfico (object o number), `valueClassName`/`color` aliasing.
- `tabular-nums` aplicado al valor — coherente con DESIGN.md regla 2.
- Sparkline slot como overlay con `opacity-30` + `pointer-events-none` — patron correcto.
- Trend coloring semantico (positive=success, negative=error, zero=muted).
- Trend arrow + porcentaje + label optional.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Heading usa `text-xs uppercase tracking-wider` — DESIGN.md:181 lo lista como anti-pattern explicito. | KpiCard.tsx:72 | Cambiar a `text-sm font-medium text-[var(--ui-text-secondary)]` sentence case. |
| C2 | Heading `text-xs` (12px) con `--ui-text-muted` (3.5:1) **falla AA**. | KpiCard.tsx:72 | Subir a `text-sm` + `--ui-text-secondary`. |
| C3 | Trend arrow es texto Unicode `↑`/`↓` — accesibilidad pasable, pero no anuncia "increased" en SR. Y el plain text trend pattern esta listado como anti-pattern (DESIGN.md:186). | KpiCard.tsx:81-87 | Wrap trend en pill (`bg-success-soft text-success rounded-full px-2`). Y agregar `aria-label="incremento de X%"` o similar. |
| C4 | `Math.abs(trendObj.value)` para mostrar el valor positivo, pero si trend.value=0 muestra "0%" sin contexto util. | KpiCard.tsx:85 | Si value=0, no mostrar trend (simplificar). |
| C5 | KpiCard NO tiene rol semantico — un grupo de KpiCards no es identificable como "grupo de metricas". | KpiCard.tsx:69 | Considerar `role="group"` con `aria-label={heading}` o wrapper `<dl><dt><dd>`. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Value `text-2xl font-bold` (24px bold Montserrat) — apropiado para dashboards, pero DESIGN.md sugiere Quicksand para "hero numbers B2C". JP indica que dashboards (Engine/Radar/Finance) usan Montserrat. KpiCard es ambiguo. | KpiCard.tsx:75 | Agregar prop opcional `display?: boolean` -> aplica `var(--ui-font-display)` (Quicksand). |
| P2 | Padding `p-5` (20px) — fuera del scale (`--ui-space-4` 16, `--ui-space-6` 24). DESIGN.md:80 prohibe explicitamente. | KpiCard.tsx:69 | Cambiar a `p-6` o exponer prop. |
| P3 | Icon container `h-10 w-10` (40px) — escala razonable. | KpiCard.tsx:95 | OK. |
| P4 | Sparkline `h-12` (48px) overlay — bottom-anchored bien, pero `opacity-30` sobre `--ui-text-muted` fondo da grafico apenas legible. | KpiCard.tsx:101 | Subir opacidad a 0.5 o usar `--ui-primary-soft` background con sparkline brand-coloreado. |
| P5 | `font-bold` (700) en value + `font-medium` (500) en heading — jerarquia clara, pero podria usar `font-semibold` (600) en value para tonos mas profesionales (Vercel, Linear pattern). | KpiCard.tsx:75 | Decision JP. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Value cambia sin animation — DESIGN.md regla 6 ("Tabular-nums + cross-fade en value changes"). | KpiCard.tsx:75-77 | Wrap value en `<motion.span>` con AnimatePresence + cross-fade cuando cambia. Decision: solo si `value` realmente cambia frecuente. |
| T2 | Trend arrow plain text — Emil pattern: pill con arrow icon Lucide + soft bg. | KpiCard.tsx:80-87 | Wrap trend en `Badge variant='success'/'error'` con icon `TrendingUp`/`TrendingDown`. |
| T3 | `overflow-hidden` en el card permite que el sparkline se clippee bonito al borde — bueno. Pero el border-radius del card es `xl` (16px) y el sparkline plano abajo no respeta esa curva visualmente. | KpiCard.tsx:69, 100-103 | Sparkline mismo no aplica radius — el container clipea. OK. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si** — todos los colores via tokens.
- Issue especifico de light: el contrast del trend en `var(--ui-success)` (light: `#16a34a`) sobre `var(--ui-surface)` (#F2F4F3) — `text-xs` (12px) puede caer borderline AA (~4.3:1). Si T2 (pill) se aplica, el problema desaparece (text en soft bg con buen contrast).

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 + C2 (heading sentence case + text-sm + token)
  - C4 (skip trend cuando value=0)
  - P2 (padding 5 -> 6)
- **Taste fixes** (require review):
  - C3 + T2 (trend como pill con icon Lucide) — patron visual fuerte, requiere alineacion JP
  - P1 (Quicksand opt-in via display prop)
  - P4 (sparkline opacity)
  - T1 (cross-fade value changes)
- **Skip** (out of scope):
  - C5 (semantic group)
  - P3, P5 — taste minor
