import { test, expect } from '@playwright/test';

// Visual snapshots — only Tier 1 (baselines committed). Tier 2 components are
// covered by a11y.spec.ts but not visual snapshots: snapshots need a baseline
// generated on CI Linux first (separate workflow_dispatch with update_snapshots).
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

for (const name of components) {
  test.describe(name, () => {
    test(`dark theme`, async ({ page }) => {
      await page.goto(`/#/${name}`);
      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });

    test(`light theme`, async ({ page }) => {
      await page.goto(`/#/${name}?theme=light`);
      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });
  });
}
