import { test, expect } from '@playwright/test';

// Visual snapshots — only Tier 1 (baselines committed). Tier 2 components are
// covered by a11y.spec.ts but not visual snapshots: snapshots need a baseline
// generated on CI Linux first (separate workflow_dispatch with update_snapshots).

/**
 * The budget is ABSOLUTE, not a ratio of the page (TD-010). These are full-page
 * shots: 1280×720 = 921.600 px, so the old `maxDiffPixelRatio: 0.01` allowed
 * 9.216 differing pixels — while the entire Checkbox showcase is ~1.024 px. That
 * made the gate blind to any small component: PR #69 changed the Checkbox's
 * border AND added a fill, and this suite reported SUCCESS.
 *
 * A ratio can't work here — it scales with the page, which is mostly empty
 * background, so the more viewport you add the less the gate sees. An absolute
 * count is independent of that. Playwright's per-pixel `threshold` (0.2 YIQ,
 * default) already absorbs anti-aliasing noise, so this only needs to cover
 * residual subpixel jitter, not real repaints.
 */
const MAX_DIFF_PIXELS = 100;
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
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });

    test(`light theme`, async ({ page }) => {
      await page.goto(`/#/${name}?theme=light`);
      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        maxDiffPixels: MAX_DIFF_PIXELS,
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
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });

    test(`light theme`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/#/${name}?theme=light`);
      await page.waitForTimeout(250);
      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  });
}
