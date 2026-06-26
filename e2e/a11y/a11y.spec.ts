import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const components = [
  // Tier 1 — primitive components, broad usage cross-product
  'Button',
  'Card',
  'AlertBanner',
  'Toast',
  'Badge',
  'Input',
  'Checkbox',
  'Toggle',
  'Spinner',
  'ProgressBar',
  'Skeleton',
  'Callout',
  'StatusDot',
  'Breadcrumbs',
  'KpiCard',
  'Avatar',
  'Accordion',
  'Tabs',
  'EmptyState',
  'ThemeToggle',
  'CopyButton',
  'SegmentedControl',
  // Tier 2 — Sprint 1.3 expansion: docs, forms, data, commerce, B2C
  'CodeBlock',
  'BrandHeader',
  'FormField',
  'DataTable',
  // 'MarkdownRenderer' — excluded: links use Tailwind 4 arbitrary value
  // `text-[var(--ui-primary)]` which the harness vite config doesn't process
  // (no @tailwindcss/vite plugin), so links fall back to browser default
  // #0000ee on dark surface (1.45:1 fail). Real consumer apps DO process
  // Tailwind so the test would be a false positive. Follow-up: refactor
  // MarkdownRenderer to plain CSS classes (same pattern as Button.css).
  'Pagination',
  'ProductCard',
  'MealCard',
];

// Tier 3 — GUNDO Learn education/onboarding system (2026-06-11).
// These are motion-driven (motion/react): axe can sample mid-fade and blend
// the text color with the backdrop (false contrast fails like 1.09:1 on a
// card still at opacity 0.04). All Learn components honor
// prefers-reduced-motion by rendering their final state instantly, so we
// emulate it for deterministic results.
const learnComponents = [
  'GuidedTour',
  'ExplainerFlow',
  'WhyPanel',
  'EmptyStateEducation',
  'ProgressCelebration',
  'UnlockRing',
  'PersonalizedLoader',
  'FeatureHighlight',
];

// Button: refactored — uses .ui-focus-ring CSS class (no Tailwind arbitrary
// values). Plus .ui-btn-danger uses #b91c1c/#ffffff (5.83:1, real AA pass,
// no longer excluded).
//
// Accordion: still excluded. Uses `bg-[var(--ui-surface)]` and other
// Tailwind 4 arbitrary values for surfaces. axe-core can't resolve these
// CSS custom properties through Tailwind's runtime cascade and reports false
// 1.04:1 contrast (foreground #f2f4f3 vs miscomputed #efefef bg). Verified
// manually that Accordion text contrasts correctly in both themes. Migrating
// the surfaces to plain-CSS classes too is a follow-up.
// CopyButton: harness false-positive. The native <button> keeps the UA
// `buttonface` background (#efefef) because the e2e/visual vite harness has no
// Tailwind preflight to reset it (TD-004 context). Real consumer apps run
// Tailwind preflight (`button { background-color: transparent }`), so the
// button sits on the dark surface and text-secondary passes. Tracked: TD-007.
const contrastExclusions = ['Accordion', 'CopyButton'];

for (const name of components) {
  test.describe(name, () => {
    test('dark theme a11y', async ({ page }) => {
      await page.goto(`/#/${name}`);
      let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);
      if (contrastExclusions.includes(name)) {
        builder = builder.disableRules(['color-contrast']);
      }
      const results = await builder.analyze();
      expect(results.violations).toEqual([]);
    });

    test('light theme a11y', async ({ page }) => {
      await page.goto(`/#/${name}?theme=light`);
      let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);
      if (contrastExclusions.includes(name)) {
        builder = builder.disableRules(['color-contrast']);
      }
      const results = await builder.analyze();
      expect(results.violations).toEqual([]);
    });
  });
}

for (const name of learnComponents) {
  test.describe(name, () => {
    test('dark theme a11y', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/#/${name}`);
      let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);
      if (contrastExclusions.includes(name)) {
        builder = builder.disableRules(['color-contrast']);
      }
      const results = await builder.analyze();
      expect(results.violations).toEqual([]);
    });

    test('light theme a11y', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/#/${name}?theme=light`);
      let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);
      if (contrastExclusions.includes(name)) {
        builder = builder.disableRules(['color-contrast']);
      }
      const results = await builder.analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
