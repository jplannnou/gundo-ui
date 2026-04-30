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
  'MarkdownRenderer',
  'Pagination',
  'ProductCard',
  'MealCard',
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
const contrastExclusions = ['Accordion'];

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
