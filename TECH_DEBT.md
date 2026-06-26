# Technical Debt

Items spotted during development that should be fixed but don't block current work.
**Rule**: Add here instead of fixing mid-feature. Review monthly, fix at least 1 per cycle.

## Active

| ID | Description | Area | Priority | Added |
|----|-------------|------|----------|-------|
| TD-002 | axe-core `color-contrast` rule disabled in tests — CSS custom properties not resolvable in jsdom. Programmatic contrast test added as mitigation (`contrast.test.ts`). | testing | 🟢 Low | 2026-03-23 |
| TD-003 | `e2e/visual/harness.tsx` only has showcases for ~46/84 components — the full a11y sweep (`a11y-full.spec.ts`) skips the other ~38 (they render the "not found" fallback). The observatory's "color-contrast ×61 DS components" was this false positive, not real defects. Add showcases for the remaining components so the sweep gives real coverage, then gate CI on it. | testing/a11y | 🟠 High | 2026-06-04 |
| TD-005 | ~43 rare-variant arbitrary values remain after the TD-004 migration (`placeholder:`/`peer-*`/`group-hover`/`before:` + gradient `from`/`to`/`divide`) — no regression (still consumer-scanned) but worth finishing + adding an ESLint rule banning `*-[var(--ui-…)]` color utilities to prevent future drift. | architecture | 🟢 Low | 2026-06-25 |

## Done

| ID | Description | Fixed |
|----|-------------|-------|
| TD-001 | `--ui-text-muted` dark contrast — **bumped #828b98 → #9aa4b2 to pass WCAG AA (≥4.5:1) on dark surface.** (Earlier "accepted large-only"; promoted to a real fix when greening the a11y sweep.) | 2026-06-26 |
| TD-007 | CopyButton axe color-contrast on UA `#efefef` — **harness false-positive** (no Tailwind preflight in the e2e harness; real apps reset native button bg). Added `CopyButton` to `contrastExclusions` in `a11y.spec.ts`. | 2026-06-26 |
| TD-004 | (Was: harness without `@tailwindcss/vite` → colors fall back to browser defaults.) **Resolved by migrating colored arbitrary values** `*-[var(--ui-*)]` (1482 across 104 components, variant-aware) to static classes in `src/ui-classes.css`. Components now get colors from plain CSS imported per-file — independent of any consumer/harness Tailwind scan (also fixes the "invisible component" bug class + unblocks contrast testing). | 2026-06-25 (PR `ds/css-classes-and-lint`) |
| TD-006 | Card-as-button vs `CardButton` split — **keep the split.** `CardButton` (accessible native `<button>`) stays the dedicated interactive component; `Card` remains a non-interactive container, not polymorphic. | 2026-06-25 (decision) |

---
**Priority levels**: 🔴 Critical (security/data) · 🟠 High (perf/UX) · 🟡 Medium (code quality) · 🟢 Low (nice to have)
