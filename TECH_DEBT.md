# Technical Debt

Items spotted during development that should be fixed but don't block current work.
**Rule**: Add here instead of fixing mid-feature. Review monthly, fix at least 1 per cycle.

## Active

| ID | Description | Area | Priority | Added |
|----|-------------|------|----------|-------|
| TD-001 | `--ui-text-muted` dark theme: 3.5:1 contrast ratio fails WCAG AA normal text. Accepted risk — documented as large text (>=18px/14px bold) or decorative only. 57 components affected. | a11y | 🟡 Medium | 2026-03-23 |
| TD-002 | axe-core `color-contrast` rule disabled in tests — CSS custom properties not resolvable in jsdom. Programmatic contrast test added as mitigation (`contrast.test.ts`). | testing | 🟢 Low | 2026-03-23 |

## Done

| ID | Description | Fixed |
|----|-------------|-------|
| — | *(none yet)* | — |

---
**Priority levels**: 🔴 Critical (security/data) · 🟠 High (perf/UX) · 🟡 Medium (code quality) · 🟢 Low (nice to have)
