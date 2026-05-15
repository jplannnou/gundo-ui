# Audit — DataTable

**Fecha**: 2026-04-30
**Source**: src/DataTable.tsx (LOC: 202)

## Fortalezas
- Genericos TypeScript bien tipados (`<T>`, `Column<T>`, `rowKey`).
- `aria-sort` correcto en headers (`ascending`/`descending`/`none`).
- Keyboard sort (Enter/Space).
- Selection con indeterminate state (`someSelected`).
- `onClick` stopPropagation en checkbox cell — evita conflict con row click.
- Footer row support para totals.
- Sort icon dual-arrow con opacity hint correcto.

## Issues criticos (afectan a11y o produccion)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| C1 | Rows con `onRowClick` NO tienen `tabIndex={0}` ni keyboard handler — solo se pueden activar con mouse. **Falla WCAG 2.1.1 Keyboard.** | DataTable.tsx:158-164 | Agregar `tabIndex={onRowClick ? 0 : undefined}` y `onKeyDown` con Enter/Space. Tambien `role="button"` o convertir cell a `<button>`. |
| C2 | Checkbox `aria-label="Select row"` repetido para todos los rows — no diferencia que row. SR anuncia "select row" sin contexto. | DataTable.tsx:171 | `aria-label={\`Select \${idColumnText}\`}` o usar checkbox con label visible. |
| C3 | `tabular-nums` NO esta aplicado por defecto a celdas con numeros — DataTable es el caso #1 donde tabular-nums importa. Cae en cada `col.render`. | DataTable.tsx:177 | Agregar a `<td>` el class `tabular-nums` cuando `col.align === 'right'` (heuristica para columnas numericas). |
| C4 | `border-b border-[var(--ui-border)]/50` — la sintaxis Tailwind `/50` sobre arbitrary value puede no compilarse en algunos entornos (depende de Tailwind config). | DataTable.tsx:160 | Usar `var(--ui-border)` plano o introducir `--ui-border-subtle` token con la opacity baked-in. |
| C5 | Sin loading state — durante fetch la tabla muestra `emptyMessage` aunque haya data on the way. Estado mixto confuso. | DataTable.tsx:147-152 | Agregar prop `loading?: boolean` con skeleton rows o spinner overlay. |
| C6 | Header `text-[var(--ui-text-muted)]` (3.5:1) en `text-sm` (14px). Falla AA en small text. | DataTable.tsx:129 | Cambiar a `text-[var(--ui-text-secondary)]`. |

## Polish (mejora visual/feel)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| P1 | Hover sobre row clickable cambia `bg` pero no hay cursor visual feedback ademas. `cursor-pointer` ya esta. OK. | DataTable.tsx:162 | OK. |
| P2 | No hay visualizacion de "selected count" ni bulk actions integradas — solo la API. | DataTable.tsx:51-63 | Documentar pattern (consumer responsable). OK. |
| P3 | `px-4 py-2` en celdas, `px-4 py-2.5` en headers — la diferencia de 0.5 (2px) crea micro-shift visible cuando density alta. | DataTable.tsx:177, 129 | Match: ambos `py-2.5` o ambos `py-2`. |
| P4 | Sort icon `ChevronUp/Down` con `-space-y-1.5` — el efecto layered es claro pero los iconos overlap visualmente cuando ambos en opacity 0.3. | DataTable.tsx:42-46 | Considerar single icon `ChevronsUpDown` (Lucide) cuando inactive, `ChevronUp`/`ChevronDown` solido cuando active. |
| P5 | No hay sticky header — tablas largas pierden contexto al hacer scroll. | DataTable.tsx:112-145 | Agregar prop `stickyHeader?: boolean` -> `position: sticky; top: 0; background`. |
| P6 | Sin row striping ni column dividers — denso pero no sobre-estilado. Esta bien para Linear-style, pero algunos usuarios necesitan ver "este row es par" rapido. | DataTable.tsx:154-184 | Decision JP: agregar prop `striped?: boolean`. |

## Taste / motion (Emil Kowalski lens)
| # | Issue | Linea | Fix sugerido |
|---|-------|-------|--------------|
| T1 | `transition-colors` por default Tailwind sin token. | DataTable.tsx:160 | `transition-[background-color] duration-[var(--ui-duration-fast)]`. |
| T2 | Sort icon "snap" entre estados — Emil pattern: rotate 180deg para flip, o crossfade. | DataTable.tsx:42-46 | Animar opacity entre estados o swap con AnimatePresence. |
| T3 | Selected row usa `bg-[var(--ui-primary-soft)]` — bien, pero el cambio de no-selected a selected es instant. | DataTable.tsx:161 | Si T1 incluye background, ya queda. |

## Theme parity (dark vs light)
- Tokens hardcoded? **No.**
- Funciona en light theme? **Si** — todos los colores via tokens.
- Issue especifico de light: en light theme el `accent-[var(--ui-primary)]` (verde oscuro) sobre checkbox nativo se ve OK. El `var(--ui-border)/50` puede dar borders casi invisibles en light theme.

## Recommended PR scope
- **Safe fixes** (auto-merge):
  - C1 (row keyboard activation)
  - C3 (tabular-nums en align-right)
  - C4 (border opacity sin sintaxis riesgosa)
  - C6 (header color secondary)
  - P3 (padding match headers/cells)
- **Taste fixes** (require review):
  - C5 (loading state + skeleton)
  - P4 (sort icon mejor pattern)
  - P5 (sticky header)
  - P6 (striped opcional)
  - T1 + T2 (transitions)
  - C2 (aria-label diferenciado por row)
- **Skip** (out of scope):
  - P1, P2 — no hay drift
