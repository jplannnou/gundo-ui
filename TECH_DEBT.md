# Technical Debt

Items spotted during development that should be fixed but don't block current work.
**Rule**: Add here instead of fixing mid-feature. Review monthly, fix at least 1 per cycle.

## Active

| ID | Description | Area | Priority | Added |
|----|-------------|------|----------|-------|
| TD-002 | axe-core `color-contrast` rule disabled in tests — CSS custom properties not resolvable in jsdom. Programmatic contrast test added as mitigation (`contrast.test.ts`). | testing | 🟢 Low | 2026-03-23 |
| TD-003 | `e2e/visual/harness.tsx` only has showcases for ~46/84 components — the full a11y sweep (`a11y-full.spec.ts`) skips the other ~38 (they render the "not found" fallback). The observatory's "color-contrast ×61 DS components" was this false positive, not real defects. Add showcases for the remaining components so the sweep gives real coverage, then gate CI on it. | testing/a11y | 🟠 High | 2026-06-04 |
| TD-005 | ~43 rare-variant arbitrary values remain after the TD-004 migration (`placeholder:`/`peer-*`/`group-hover`/`before:` + gradient `from`/`to`/`divide`) — no regression (still consumer-scanned) but worth finishing + adding an ESLint rule banning `*-[var(--ui-…)]` color utilities to prevent future drift. | architecture | 🟢 Low | 2026-06-25 |
| TD-008 | Preexisting lint debt at shared-config adoption: 33 problems (4 errors, 29 warnings) — mostly `consistent-type-imports` errors + `no-unused-vars` warnings in tests. Not fixed inline; CI runs `@jplannnou/eslint-config` in ratchet mode (only changed files gated), so debt burns down organically. | tooling | 🟡 Medium | 2026-07-02 |
| TD-010 | **The visual regression gate is blind to small components.** `components.spec.ts` screenshots the **whole page** with `maxDiffPixelRatio: 0.01`. Viewport is 1280×720 = 921.600 px → the budget is **9.216 differing px**, while the entire Checkbox showcase (4 boxes × 16×16) is **1.024 px**. Repainting the component completely uses ~11% of the allowance, so *no* small-component change can ever fail. Proof: PR #69 changed the Checkbox's border colour **and** added a fill, and `visual` reported SUCCESS against a June baseline. Combined with TD-002 (axe `color-contrast` off) and TD-003 (sweep skips ~38 components), this is why the invisible checkbox shipped and survived. Fix: screenshot the component container (`#root`/showcase wrapper) instead of the page so the ratio is relative to the component's own area — then regenerate all baselines via `visual.yml` `workflow_dispatch` + `update_snapshots` (they must be Linux-CI-generated). | testing/a11y | 🟠 High | 2026-07-15 |
| TD-009 | **`text-white` on semantic-color backgrounds fails contrast in the dark theme.** Root cause: TD-001 tuned the dark tokens to be readable *as text on* the dark surface, which made them light — and therefore bad *as backgrounds under* white ink. Measured with `getContrastRatio` on dark: white on `primary #67C728` **2.15:1**, `success #22c55e` **2.28:1**, `error #f87171` **2.77:1**, `warning #f59e0b` **2.15:1**, `--ui-gradient` mid `#409C35` **3.49:1**. Fix is `gu-text-surface` (the token flips with the theme: 6.35:1 dark / 8.71:1 light) — already applied to `Checkbox` + already correct in `RadioGroup`. **Still open**: `Pagination:66` and `StepIndicator:28` (`gu-bg-primary text-white`, normal text → needs 4.5:1); `UploadWizard:154` (`gu-bg-success`); `BottomBar:61` + `FloatingActionButton:62` (`gu-bg-error` badges); `PaywallUnified:263,426` (on `--ui-gradient`, `text-sm` so 4.5:1 applies — the "text-white intencional" comment predates measurement). Invisible to CI because axe's `color-contrast` is off (TD-002) and the sweep skips ~38 components (TD-003). | a11y | 🟠 High | 2026-07-15 |

## Done

| ID | Description | Fixed |
|----|-------------|-------|
| TD-001 | `--ui-text-muted` dark contrast — **bumped #828b98 → #9aa4b2 to pass WCAG AA (≥4.5:1) on dark surface.** (Earlier "accepted large-only"; promoted to a real fix when greening the a11y sweep.) | 2026-06-26 |
| TD-007 | CopyButton axe color-contrast on UA `#efefef` — **harness false-positive** (no Tailwind preflight in the e2e harness; real apps reset native button bg). Added `CopyButton` to `contrastExclusions` in `a11y.spec.ts`. | 2026-06-26 |
| TD-004 | (Was: harness without `@tailwindcss/vite` → colors fall back to browser defaults.) **Resolved by migrating colored arbitrary values** `*-[var(--ui-*)]` (1482 across 104 components, variant-aware) to static classes in `src/ui-classes.css`. Components now get colors from plain CSS imported per-file — independent of any consumer/harness Tailwind scan (also fixes the "invisible component" bug class + unblocks contrast testing). | 2026-06-25 (PR `ds/css-classes-and-lint`) |
| TD-006 | Card-as-button vs `CardButton` split — **keep the split.** `CardButton` (accessible native `<button>`) stays the dedicated interactive component; `Card` remains a non-interactive container, not polymorphic. | 2026-06-25 (decision) |

---
**Priority levels**: 🔴 Critical (security/data) · 🟠 High (perf/UX) · 🟡 Medium (code quality) · 🟢 Low (nice to have)
