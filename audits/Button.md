# Audit — Button

**Fecha**: 2026-04-30
**Source**: src/Button.tsx (LOC: 71) + src/Button.css (LOC: 71)

## Fortalezas
- API rica + retro-compatible (`primary`/`default`, `danger`/`destructive`) con un solo source of truth en `variantStyles`.
- `forwardRef` correcto, `disabled || loading`, `aria-hidden` en spinner — bases sólidas.
- CSS plano (no Tailwind arbitrary values) — desacopla del scanning de consumers, decisión arquitectónica acertada.
- Soft variant ya integrada (Sprint 1) consistente con design tokens.
- Active scale `0.97` da feedback haptico discreto (Emil-friendly).

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Loading state hardcodea `"Loading..."` en ingles, sin i18n y oculta los `children` (problema en consumer de habla hispana — Vida/Datacenter usan ES). | Button.tsx:58 | Agregar prop opcional `loadingLabel?: string` con default `'Loading...'`. Mejor: mantener `children` visible y solo reemplazar icono — mas predecible. |
| C2 | Loading no anuncia status a screen readers (no hay `aria-busy` ni `aria-live`). | Button.tsx:49-54 | Agregar `aria-busy={loading}` al `<button>`. |
| C3 | `.ui-btn-danger` y `.ui-btn-destructive` usan `color: #ffffff` hardcodeado — viola regla "nunca pure white". En light theme `--ui-error` (#dc2626) sobre white da AA pero el design rule lo prohibe explicitamente. | Button.css:29 | Cambiar a `color: var(--ui-surface)` o introducir token `--ui-on-error` (defaultea a `#fff` pero overridable). |
| C4 | `.ui-btn-soft:hover` aplica `filter: brightness(1.1)` sobre fondo translucido (`--ui-primary-soft` con alpha 0.15) — el resultado en surfaces variadas es impredecible. En light theme con `--ui-primary` cambiando a secondary verde oscuro, `brightness(1.1)` se ve plano. | Button.css:50-52 | Cambiar a transicion de alpha: subir opacidad del soft fill a 0.25 en hover via background. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | `transition-colors` cubre solo background/color — el `active:scale-[0.97]` no esta en `transition`, asi que el press feedback es instantaneo (ok) pero el release tambien — siente cortado. | Button.tsx:52 | Agregar `transition-[transform,background-color,color]` con `duration-fast` + `ease-out`. |
| P2 | `iconPosition='right'` no ajusta padding asimetrico — buttons con icon-right se ven mas pesados visualmente que icon-left por la lectura LTR. | Button.tsx:62-64 | Considerar `pl-4 pr-3` cuando `icon && iconPosition==='right'` para balancear el peso optico. |
| P3 | Size `icon` (`h-9 w-9`) no escala con `size='sm'`/`size='lg'` — solo existe un tamano de icon button. | Button.tsx:33 | Combinar `size` + `iconOnly` boolean, o crear sizes `icon-sm`/`icon-md`/`icon-lg`. Decision JP. |
| P4 | Loading icon size `h-4 w-4` fijo — en `size='lg'` con `text-base` se ve subdimensionado. | Button.tsx:57 | Tamano de spinner relativo: `h-4 w-4` en sm/md, `h-5 w-5` en lg. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | `transition-colors` (200ms default Tailwind) sin token — el design system pide `--ui-duration-fast` (150ms) para hover de color. Drift respecto a `DESIGN.md`. | Button.tsx:52 | `transition-[background-color,color,transform] duration-[var(--ui-duration-fast)] ease-[var(--ui-ease-out)]`. |
| T2 | `.ui-btn-link` usa `text-decoration: underline` solo on hover — common; pero podria sumar `underline-offset` animado (4px reposo, 2px hover) para sentir mas premium. Decision de taste, no urgente. | Button.css:63-70 | Opcional: `text-underline-offset` transition. |
| T3 | El spinner `Loader2` tiene rotacion pero sin tabular-nums en el texto adyacente "Loading..." — si fuera `Loading 0/3` por ejemplo el texto saltaria. | Button.tsx:55-58 | Si se i18niza con counter, `tabular-nums`. |

## Theme parity (dark vs light)
- Tokens hardcoded? **Si** — `color: #ffffff` en `.ui-btn-danger`/`.ui-btn-destructive` (Button.css:29).
- Funciona en light theme? **Parcial** — primary cambia a secondary (verde oscuro), text remains `var(--ui-surface)` que en light es `#F2F4F3` (warm off-white). Esto efectivamente da texto blanco sobre verde oscuro: AA OK, pero rompe el patron donde `--ui-surface` deberia ser oscuro.
- Issue especifico de light: el patron `bg-[var(--ui-primary)] text-[var(--ui-surface)]` es inteligente porque siempre invierte, pero confunde a quien lee `text-[var(--ui-surface)]` esperando charcoal. Documentar en CLAUDE.md (ya esta marcado en "Known Gotchas").

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C2 (`aria-busy`)
  - C3 (`#ffffff` -> `var(--ui-surface)`)
  - C1 (prop `loadingLabel` + mantener children visible)
  - T1 (alinear duration con tokens)
- **Taste fixes** (require review):
  - P2 (padding asimetrico icon-right)
  - P3 (icon button sizes)
  - C4 (cambio de hover de soft variant)
  - T2 (underline-offset link)
- **Skip** (out of scope):
  - P1 (cosmetic, low priority)
  - P4 (spinner size lg) — solo si JP usa size lg con loading frecuentemente
