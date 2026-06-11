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

// ─── GUNDO Learn components ───────────────────────────────────────────
// These are motion-driven (motion/react, JS animations) so the global
// `animations: 'disabled'` (CSS-only) is not enough: we emulate
// prefers-reduced-motion, which every Learn component honors by rendering
// its final state instantly — deterministic pixels.
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

for (const name of learnComponents) {
  test.describe(name, () => {
    test(`dark theme`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/#/${name}`);
      await page.waitForTimeout(250); // portal mount + layout settle
      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });

    test(`light theme`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/#/${name}?theme=light`);
      await page.waitForTimeout(250);
      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });
  });
}
