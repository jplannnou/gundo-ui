import { test, expect } from '@playwright/test';

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
      await page.waitForTimeout(300); // let animations settle
      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });

    test(`light theme`, async ({ page }) => {
      await page.goto(`/#/${name}?theme=light`);
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });
  });
}
