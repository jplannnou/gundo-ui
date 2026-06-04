# Technical Debt

Items spotted during development that should be fixed but don't block current work.
**Rule**: Add here instead of fixing mid-feature. Review monthly, fix at least 1 per cycle.

## Active

| ID | Description | Area | Priority | Added |
|----|-------------|------|----------|-------|
| TD-001 | `--ui-text-muted` dark theme: 3.5:1 contrast ratio fails WCAG AA normal text. Accepted risk — documented as large text (>=18px/14px bold) or decorative only. 57 components affected. | a11y | 🟡 Medium | 2026-03-23 |
| TD-002 | axe-core `color-contrast` rule disabled in tests — CSS custom properties not resolvable in jsdom. Programmatic contrast test added as mitigation (`contrast.test.ts`). | testing | 🟢 Low | 2026-03-23 |
| TD-003 | `e2e/visual/harness.tsx` only has showcases for ~46/84 components — the full a11y sweep (`a11y-full.spec.ts`) skips the other ~38 (they render the "not found" fallback). The observatory's "color-contrast ×61 DS components" was this false positive, not real defects. Add showcases for the remaining components so the sweep gives real coverage, then gate CI on it. | testing/a11y | 🟠 High | 2026-06-04 |
| TD-004 | `e2e/visual/vite.config.ts` has no `@tailwindcss/vite` plugin → components whose colors come from Tailwind utility classes (MarkdownRenderer link `text-[var(--ui-primary)]` falls back to browser-default `#0000ee`; Accordion surfaces) render unstyled and false-positive in the a11y sweep. Either add the Tailwind plugin to the harness or migrate those components to plain-CSS classes (Button.css pattern). | testing/a11y | 🟡 Medium | 2026-06-04 |

## Done

| ID | Description | Fixed |
|----|-------------|-------|
| — | *(none yet)* | — |

---
**Priority levels**: 🔴 Critical (security/data) · 🟠 High (perf/UX) · 🟡 Medium (code quality) · 🟢 Low (nice to have)
