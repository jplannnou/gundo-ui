# Audit — Avatar

**Fecha**: 2026-04-30
**Source**: src/Avatar.tsx (LOC: 54)

## Fortalezas
- 5 sizes con escala razonable.
- Fallback inteligente: src -> initials -> getInitials(alt) -> '?'.
- Usa `--ui-primary-soft` + `--ui-primary` para el fallback — coherente con brand.
- `getInitials` toma 2 letras max, uppercase, filter empty.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | `<img>` sin handler `onError` — si la URL falla, queda alt text + icono roto. Avatares de OAuth/Gravatar fallan seguido. | Avatar.tsx:33-40 | Agregar `useState` con `imageError` y fallback al div con initials. |
| C2 | `<img alt={alt \|\| ''}>` — alt vacio si no se pasa `alt`. Un usuario sin "alt" tendria un avatar decorativo, pero **ese avatar suele representar a una persona** -> alt no deberia ser vacio en contexto de UserMenu/Comment. | Avatar.tsx:37 | Documentar: si Avatar representa persona, `alt` es obligatorio. Considerar TypeScript override. |
| C3 | `aria-label={alt}` aplicado al div fallback (initials) — pero `alt` puede ser undefined ("?" mostrado), entonces `aria-label={undefined}` y el initials no se anuncian. | Avatar.tsx:48 | Usar `aria-label={alt || initials || 'Avatar'}` o simplemente agregar `role="img"` con label apropiado. |
| C4 | Tamanos hardcoded en pixels via Tailwind classes — no usa scale del DESIGN system. `w-6 h-6` (24px), `w-12 h-12` (48px) — `--ui-spacing-*` solo va hasta 5rem, asi que esto es OK pero deberia documentarse como excepcion. | Avatar.tsx:11-17 | OK, pero anotar en CLAUDE.md. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | No hay status indicator integrado (online dot) — feature comun. JP Asistant + Radar lo necesitarian. | Avatar.tsx:30 | Agregar prop `status?: 'online' | 'busy' | 'offline'` con dot bottom-right. |
| P2 | `xs` size `text-[10px]` — fuera del scale (`xs` es 12px). Drift. | Avatar.tsx:12 | El text en avatar es decorativo, OK como excepcion, pero podria justificarlo el comentario. |
| P3 | Imagen no tiene `loading="lazy"` — listas con muchos avatares cargan todo. | Avatar.tsx:35-39 | `loading="lazy"` por default, override via prop si es above-the-fold. |
| P4 | No `border` opcional — Avatares apilados (`UserMenu` stack pattern) suelen necesitar `ring-2 ring-surface` para separar. | Avatar.tsx:30 | Decision JP: prop `bordered?: boolean` o pasar via className. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | Sin transition entre src loading y el final paint — flickea. | Avatar.tsx:33-40 | Agregar `transition-opacity` con onLoad fade-in. |
| T2 | El fallback initial color es `--ui-primary` (verde GUNDO) — si el avatar representa N usuarios distintos, todos comparten color. Patron mas pulido: hash el nombre y mapear a un set de colores brand. | Avatar.tsx:47 | Decision: introducir prop `colorByName?: boolean` o implementarlo siempre. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si** — `--ui-primary` cambia (verde claro -> oscuro), `--ui-primary-soft` baja opacity. Visualmente coherente.
- Issue especifico de light: `--ui-primary-soft` light es `rgb(8 86 62 / 0.1)` — el text `#08563E` sobre fondo `rgba(8,86,62,0.1)` mezclado con surface light (`#F2F4F3`) sigue legible.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (`onError` -> fallback initials)
  - C3 (aria-label usable)
  - P3 (`loading="lazy"`)
  - T1 (fade-in on load)
- **Taste fixes** (require review):
  - C2 (alt obligatorio cuando representa persona) — tipo design decision
  - P1 (status indicator)
  - P4 (bordered prop)
  - T2 (color by name hashing)
- **Skip** (out of scope):
  - P2, C4 — drifts aceptables
