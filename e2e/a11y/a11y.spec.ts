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
  // MarkdownRenderer was excluded for the same reason as Accordion/CopyButton —
  // the harness didn't process Tailwind, so its links fell back to #0000ee
  // (1.45:1). harness.css fixes that, so it is checked again.
  'MarkdownRenderer',
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
// Accordion and CopyButton used to be excluded here, both for the same reason:
// the harness had no Tailwind, so surfaces fell back to the UA `buttonface`
// #efefef and axe computed false 1.04:1 contrast. The harness now imports
// Tailwind (harness.css) and gets the real preflight, so the cause is gone and
// the exclusions with it — these components are contrast-checked again.
//
// Nothing is excluded wholesale any more. When a violation is a genuine WCAG
// exemption rather than a bug, mark the element `data-axe-exempt="<reason>"` in
// the harness: it scopes the suppression to that element instead of blinding a
// whole component, and it has to state why.
const contrastExclusions: string[] = [];

for (const name of components) {
  test.describe(name, () => {
    test('dark theme a11y', async ({ page }) => {
      await page.goto(`/#/${name}`);
      let builder = new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('[data-axe-exempt]');
      if (contrastExclusions.includes(name)) {
        builder = builder.disableRules(['color-contrast']);
      }
      const results = await builder.analyze();
      expect(results.violations).toEqual([]);
    });

    test('light theme a11y', async ({ page }) => {
      await page.goto(`/#/${name}?theme=light`);
      let builder = new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('[data-axe-exempt]');
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
      let builder = new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('[data-axe-exempt]');
      if (contrastExclusions.includes(name)) {
        builder = builder.disableRules(['color-contrast']);
      }
      const results = await builder.analyze();
      expect(results.violations).toEqual([]);
    });

    test('light theme a11y', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/#/${name}?theme=light`);
      let builder = new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('[data-axe-exempt]');
      if (contrastExclusions.includes(name)) {
        builder = builder.disableRules(['color-contrast']);
      }
      const results = await builder.analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
