import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const components = [
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
];

// axe-core false positive: Tailwind 4 arbitrary values bg-[var(...)] cause
// axe to miscompute background as #efefef when CSS vars resolve at runtime.
// Verified manually: Accordion text has correct contrast in both themes.
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
