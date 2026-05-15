# Audit — PricingCard

**Fecha**: 2026-04-30
**Source**: src/PricingCard.tsx (LOC: 149)

## Fortalezas
- API clara: name, price, period, description, features, badge, highlighted, CTA.
- Highlighted variant con ring effect (`shadow-[0_0_0_4px_var(--ui-primary-soft)]`) — visualmente destaca.
- "Gratis" handling cuando price=0.
- Features con check/x SVG inline + included/excluded styling.
- Loading state en CTA con spinner.
- `<article aria-label={...}>` semantico.
- Tooltip via `title` attribute en feature text.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Plan name `text-sm uppercase tracking-wider` — anti-pattern (DESIGN.md:181). | PricingCard.tsx:75-76 | `text-base font-semibold text-[var(--ui-text-secondary)]` sentence case. |
| C2 | Plan name `--ui-text-muted` en `text-sm` — falla AA. | PricingCard.tsx:75 | `--ui-text-secondary`. |
| C3 | Feature `<li>` con icon `aria-hidden` + text — el "incluido" vs "excluido" se comunica visualmente solo. SR no anuncia el estado. | PricingCard.tsx:108-141 | Agregar `<span class="sr-only">{feat.included ? 'Incluido' : 'No incluido'}: </span>` antes del texto. |
| C4 | `feat.tooltip` rendered como `title` attribute — solo accessible via mouse hover. Keyboard/SR users no pueden acceder. | PricingCard.tsx:136 | Si tooltip importa, usar `<Tooltip>` real del lib. Sino, ofrecer info en otro mecanismo (asterisk + footnote). |
| C5 | Highlighted card usa `bg-[var(--ui-primary-soft)]` — features `--ui-text-secondary` sobre ese fondo en light theme puede caer borderline. | PricingCard.tsx:60 | Verificar contrast en light + dark. |
| C6 | Price "Gratis" cae al `text-4xl font-bold` igual que un precio numerico — visualmente OK pero "Gratis" en hero size pierde la unidad de comparacion. Bien. | PricingCard.tsx:79 | OK. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | `text-4xl` (36px) en price — DESIGN.md tiene `--ui-font-size-2xl` (24px) como max. 4xl es Tailwind default escapando del system. Drift. | PricingCard.tsx:79 | Pricing es marketing, `text-4xl` es justificable. Documentar excepcion o introducir `--ui-font-size-3xl` (30px), `--ui-font-size-4xl` (36px). |
| P2 | Price NO usa `--ui-font-display` (Quicksand) — DESIGN.md regla 5 sugiere Quicksand para hero numbers B2C. Pricing card es definitivamente B2C. | PricingCard.tsx:79 | Agregar `font-[var(--ui-font-display)]`. |
| P3 | Period `--ui-text-muted` en `text-sm` — fail AA. | PricingCard.tsx:81 | `--ui-text-secondary`. |
| P4 | Features descripcion `--ui-text-secondary` cuando included, `--ui-text-muted` cuando excluded. Excluded `text-sm` en muted = fail AA. | PricingCard.tsx:133-135 | Excluded: `--ui-text-muted line-through` is intencionalmente reduced visual weight, pero cae bajo AA. Solucion: aceptar como decoracion (line-through ya lo marca) y documentar excepcion. |
| P5 | Description `text-sm` (14px) en `--ui-text-secondary` (`#9ca3af` ~6:1) — OK. | PricingCard.tsx:85 | OK. |
| P6 | `rounded-2xl` (16px) — el design system tiene `--ui-radius-xl` (16px). Usar token. | PricingCard.tsx:58 | `rounded-[var(--ui-radius-xl)]`. |
| P7 | Highlighted shadow stack `shadow-[0_0_0_4px_var(--ui-primary-soft)]` — patron "ring" emulado con shadow. Funciona, pero CSS `outline: 4px solid var(--ui-primary-soft)` o `ring-4 ring-[var(--ui-primary-soft)]` Tailwind seria mas semantico. | PricingCard.tsx:60 | OK funcionalmente. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Sin transitions en hover — pricing card estatica. Aceptable para pricing (no quieres distract user from decision). | PricingCard.tsx:56-63 | OK por ahora. |
| T2 | Loading spinner en CTA inline + texto — al click, el spinner aparece y el text "Empezar" se queda. UX OK. | PricingCard.tsx:100-103 | OK. |
| T3 | Highlighted ring no tiene transicion — si highlighted es dynamic, snap. | PricingCard.tsx:60 | `transition-[box-shadow,border-color]` con tokens. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si.**
- Issue light:
  - Highlighted: `bg-[var(--ui-primary-soft)]` light = `rgb(8 86 62 / 0.1)` (verde oscuro casi imperceptible) sobre surface light `#F2F4F3` — el highlighted visual se debilita. **Considerar tinte mas fuerte en light o solo border + ring.**
  - Badge `text-[var(--ui-surface)]` light = `#F2F4F3` (warm off-white) sobre `--ui-primary` light (verde oscuro) — AA OK.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 + C2 (plan name sentence case + secondary color)
  - C3 (sr-only "Incluido/No incluido")
  - P3 (period color secondary)
  - P6 (rounded-xl token)
- **Taste fixes** (require review):
  - C4 (feat.tooltip via Tooltip real vs `title`)
  - C5 (validar contrast highlighted en light)
  - P1 + P2 (price font display + introducir font-3xl/4xl tokens)
  - P7 (ring vs shadow)
  - T3 (highlighted transition)
  - Light theme highlighted tinte mas fuerte
- **Skip** (out of scope):
  - C6, P4, P5, T1, T2 — no hay drift critico
