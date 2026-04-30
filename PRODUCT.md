# PRODUCT — @gundo/ui

## Register

**product** — `@gundo/ui` SIRVE al producto. Esta library no es brand-facing por sí misma; es el sistema de componentes que consume cada uno de los productos GUNDO (Engine, Finance, Radar, JP Assistant, Vida, Command Center, Ametller, Datacenter, Plataform). Las decisiones de diseño priorizan claridad funcional, accesibilidad y consistencia cross-product sobre expresividad de marca.

## Users

Dos audiencias distintas:

### 1. Developers consumers (audiencia primaria)
- **Quién**: JP + equipo que mantiene los 8 productos GUNDO
- **Necesidad**: importar componentes con API consistente, tipos TypeScript correctos, tokens CSS para tematizar, sin build step
- **Doloridos comunes**: APIs duales/legacy aliases, componentes one-off creados en consumers en vez de reusar el library, drift de spacing/colores
- **Métrica de éxito**: % adoption por consumer (Engine 86%, Radar 100%, Finance 86%, JP Asst 81%) — aspiración 95%+ todos

### 2. End-users finales (audiencia secundaria, vía consumers)
- **B2C (mi.gundo.life, Datacenter, Ametller)**: usuarios finales en wellness/nutrición — necesitan claridad emocional, motion que dé sensación de "alive", trust signals, copy en español neutro
- **B2B (Engine, Radar, Finance, Command Center)**: founders/operators/teams — necesitan densidad de información, navegación rápida, focus visible, atajos de teclado

## Brand

- **Posicionamiento**: "Health/nutrition SaaS con AI ultrapersonalización" — Gundo Health & Food
- **Personalidad**: técnico-premium, no enterprise gris ni consumer cute. Más cercano a Linear / Vercel / Stripe que a Mailchimp / Notion / Headspace
- **Color signature**: GUNDO green `#67C728` (vivo, vegetal pero no flat), gradient con `#08563E` (deep) → `#409C35` (mid green)
- **Surface signature**: dark-first charcoal `#292E37`, NO pure black — siempre con tinte tibio. Light theme es opt-in
- **Typography signature**: **Montserrat** para texto, **Quicksand** display para headings hero/marketing/B2C delight. JetBrains Mono para code/data densa

## Tone

- **B2C**: emocional pero medido. No hyped, no cute. Spanish neutro tuteo (`tú`, no `vos`)
- **B2B**: directo, técnico, accionable. Spanish rioplatense (`vos`) en producto interno, neutro en producto cliente
- **Errores**: específicos y con path de recuperación. Nunca "Algo salió mal"
- **Empty states**: invitan a actuar, no se disculpan
- **Loading**: nunca "Loading..." pelado — siempre con contexto de qué se está cargando

## Anti-references

Lo que GUNDO **NO** quiere parecerse:

- **Mailchimp / SurveyMonkey** — colorful flat illustrations, friendly mascot energy
- **Bootstrap default** — round-everywhere, primary blue, generic shadows
- **Material Design** — ripples, FABs por todos lados, elevated cards everywhere
- **Tailwind UI tutorial slop** — gradient cards `from-purple-500 to-pink-500`, headings con `uppercase tracking-wider`, hero con avatar circles + names overlapping
- **Notion** — todo blanco, ícono de página al lado de cada cosa, gris suave que pierde jerarquía
- **Headspace / Calm** — pastels, blobs orgánicos, overcalming aesthetic — no es nuestro espíritu

## Strategic principles

### 1. Token over hardcoded
Cualquier color, spacing, radius, font-size que NO venga de un token `--ui-*` es drift. Es el rule más estricto y el que más se viola.

### 2. Dark-first, light opt-in
Default dark theme. Light theme via `.theme-light` class — pero diseñamos primero en dark, luego validamos light. Los componentes deben funcionar en ambos sin pixel-pushing por theme.

### 3. Componentes reusables > one-offs
Antes de crear nuevo componente en cualquier consumer: buscar en `@gundo/ui`. Si existe parecido, extender. Si no existe pero el patrón se repite, crear acá. **Nunca** componente one-off cuando hay alternativa generalizable.

### 4. Accesibilidad WCAG 2.1 AA es baseline, no feature
Focus visible siempre. Keyboard navigation siempre. ARIA correctos. Contrast mínimo 4.5:1 (3:1 para large text). 58 axe-core tests + skill `/a11y` cubren esto.

### 5. Motion sirve, no decora
Easing custom desde tokens (`--ui-ease-out`, `--ui-ease-in-out`), no `ease-in-out` de Tailwind defaults. Duraciones <300ms para UI. Respeto `prefers-reduced-motion`. NO animar acciones de teclado de alta frecuencia (CommandPalette).

### 6. Tabular-nums donde haya números
KPIs, prices, stats, percentages — siempre con `tabular-nums` para evitar wobble cuando cambian.

### 7. Consistencia cross-product gana sobre flexibilidad por consumer
Si Radar quiere un Button distinto, primero discutir si es nueva variant del Button compartido. Solo crear local si la variante no aplica a ningún otro producto.

### 8. No file: protocol drift
`@gundo/ui` se importa via `file:` protocol = copia, no symlink. Después de cada cambio, `pnpm install` en consumers. Nunca asumir que el cambio se propaga solo.

## Notas operativas

- Repo: `~/projects/gundo-ui/` — `jplannnou/gundo-ui` GitHub
- Tests: 647 (Vitest + RTL) incluyendo 58 axe-core a11y tests
- Gallery live: https://jplannnou.github.io/gundo-ui/
- Consumers actuales: Engine, Finance, Radar, JP Assistant (4 directos) + Vida, Command Center, Ametller, Datacenter (4 vía submódulos/forks)
- Stack: React 19 + TypeScript strict + CSS Custom Properties + Tailwind 4
