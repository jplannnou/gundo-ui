# Audit — ProductCard

**Fecha**: 2026-04-30
**Source**: src/ProductCard.tsx (LOC: 248)

## Fortalezas
- API completa y composable: image, brand, name, price (con originalPrice strikethrough), score badge, tags, custom action.
- Score color encoded por threshold (75/50/25) con colors semanticos.
- `<article>` semantico con `aria-label={name}`.
- Image fallback SVG inline (no broken icon).
- Compact vs full variants.
- `isInCart` state con visual diferenciado.
- `formatPrice` helper con currency.
- Hover: `scale-105` en imagen + `shadow-md` en card — pattern e-commerce coherente.
- `tabular-nums` en prices.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | `<article>` con `onClick` pero **sin** `tabIndex={0}` ni keyboard handler. Cards productos no se pueden activar con teclado. **Falla WCAG 2.1.1.** | ProductCard.tsx:81-87 | Agregar `tabIndex={onCardClick ? 0 : undefined}` + `onKeyDown` con Enter/Space. O mejor: wrapping `<a>` o `<button>` semantic. |
| C2 | `originalPrice !== price` comparacion estricta — si price es "10.00" string y originalPrice 10 number, no coincide. Pero si ambos son numbers iguales, OK. Si uno es string del consumer, falla. | ProductCard.tsx:198 | Normalizar antes de comparar: comparar las strings ya formateadas. |
| C3 | Score badge sin `role="meter"` ni aria-valuenow. Es un dato semantico, deberia ser meter o usar aria-label completa. | ProductCard.tsx:106-113 | OK con `aria-label={\`Puntuacion: \${score}\`}` ya esta — suficiente. |
| C4 | Image NO tiene `loading="lazy"` — listings de productos cargan todas las imagenes upfront. Performance critico. | ProductCard.tsx:93-97 | Agregar `loading="lazy"` y `decoding="async"`. |
| C5 | Click on card -> `onCardClick` es event delegation, pero el button "Add to cart" ya hace `e.stopPropagation()`. Bien. Pero si el consumer agrega un Link wrappeando todo, doble accion. | ProductCard.tsx:86, 209-211 | Documentar pattern. |
| C6 | `<button aria-label={isInCart ? 'En el carrito' : ...}>` mezcla strings ES con consumer i18n. Hardcoded ES. | ProductCard.tsx:73, 214, 241 | Exponer props: `addToCartLabel`, `inCartLabel?: string` (default 'Anadido' / 'Anadir'). Ya hay `addToCartLabel`, agregar `inCartLabel`. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Brand label `text-xs uppercase tracking-wider` — anti-pattern (DESIGN.md:181). Pero en ecommerce el "BRAND NAME" pequeno uppercase es convencion universal. JP debe decidir si lib lo permite como excepcion. | ProductCard.tsx:161 | Decision JP. Si flexible: cambiar a `text-xs font-semibold` sin uppercase. |
| P2 | `text-xs` (12px) sobre `--ui-text-muted` (3.5:1) — falla AA. | ProductCard.tsx:161, 172, 179 | Cambiar `text-muted` a `text-secondary`. |
| P3 | Score badge `border-2` + `bg-[var(--ui-surface)]` — sobre image puede tener bajo contrast. | ProductCard.tsx:107 | Agregar `shadow-sm` o `backdrop-blur` sutil. |
| P4 | `h-32` / `h-44` image hardcoded — drift respecto al spacing scale. Productos pueden necesitar aspect-square o aspect-[4/3] dependiendo del catalogo. | ProductCard.tsx:91, 117 | Considerar prop `imageAspect?: 'square' | '4/3' | '16/9'`. |
| P5 | Add-to-cart button `text-xs` (12px) en `font-semibold` — minimum touch target ~32px tall (`py-1.5 + text-xs + line-height`). Borderline mobile. | ProductCard.tsx:215 | Subir a `py-2`. |
| P6 | Tags pill background `--ui-surface-hover` color `--ui-text-secondary` — chip pattern, OK. Pero los tags son `text-xs` (12px) sobre color secondary `#9ca3af` ~6:1 — AA OK. | ProductCard.tsx:181 | OK. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | `transition-shadow` (Tailwind default 200ms cubic-bezier) sin token. | ProductCard.tsx:82 | `transition-[box-shadow,transform] duration-[var(--ui-duration-normal)] ease-[var(--ui-ease-out)]`. |
| T2 | Image `scale-105` (5%) on hover — snappy pero puede sentirse exagerado en images densas. | ProductCard.tsx:96 | OK. Considerar 1.03 si imagenes saturadas. |
| T3 | `transition-transform duration-300` — duracion excede el cap design system (300ms es border, OK). | ProductCard.tsx:96 | OK. |
| T4 | Add-to-cart button no tiene anim al cambiar de "Anadir" -> "Anadido" — un check icon que crece o crossfade es Emil-tier polish. | ProductCard.tsx:221-240 | Wrap button content con AnimatePresence + crossfade. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si** — todos via tokens, incluyendo `color-mix(in srgb, var(--ui-success) 15%, transparent)` (modern, supported all browsers desde 2023).
- Issue light: shadow `[var(--ui-shadow-md)]` ya tiene values diferentes light vs dark, OK.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (keyboard activation)
  - C4 (`loading="lazy"`)
  - C6 (`inCartLabel` prop opcional)
  - P2 (text-secondary instead of muted en xs)
  - P5 (button `py-2`)
  - T1 (transition tokens)
- **Taste fixes** (require review):
  - P1 (brand uppercase decision)
  - P3 (score badge contrast)
  - P4 (imageAspect prop)
  - T4 (anim on cart toggle)
  - C2 (price comparison normalize)
- **Skip** (out of scope):
  - C3, C5, P6, T2, T3 — no hay drift critico
