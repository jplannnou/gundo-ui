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
 * count is independent of that. 100 is measured, not guessed: two consecutive
 * `--update-snapshots` runs on CI produce byte-identical output for all 60
 * baselines, so there is no jitter band to absorb — components are either
 * pixel-identical or genuinely changed.
 *
 * ⚠️ WHY THE BASELINES WERE WRONG FOR MONTHS — the trap to not fall into again:
 * `toHaveScreenshot` polls, comparing each frame against the expected image, and
 * stops the moment one MATCHES. The harness runs on the Vite **dev** server, so
 * `import './ui-classes.css'` is injected by JS after first paint — there is a
 * window where components render unstyled. A baseline recorded in that window is
 * self-perpetuating: every later run matches an early unstyled frame, stops, and
 * passes. The suite was asserting that components look like their broken,
 * style-less selves. `--update-snapshots` has nothing to match, so it waits for
 * stability and captures the real render — which is why regenerating changed 41
 * of 60 baselines (Callout by 554.392 px: the soft backgrounds were simply
 * absent). Corollary: a green visual run does NOT prove the baseline is truthful.
 * If you regenerate and see a large diff, look at the image before assuming drift.
 */
const MAX_DIFF_PIXELS = 100;

/**
 * ⚠️ A component absent from this list is NOT guarded, however green the job is.
 * TD-009 repainted Pagination and FloatingActionButton (white ink → surface ink)
 * and `visual` stayed green — not because it looked, but because it wasn't
 * looking: neither had a baseline. Both are added below. StepIndicator,
 * UploadWizard and BottomBar were repainted by the same PR and still aren't
 * here — they have no showcase in harness.tsx yet (TD-003).
 *
 * To add one: give it a showcase, add it here, then generate the baseline on CI
 * Linux (`visual.yml` → workflow_dispatch → update_snapshots) and commit it. Do
 * NOT let a missing baseline be written by a normal run: with `retries: 2` the
 * first attempt writes it and fails, the retry compares against what it just
 * wrote, and the test passes — locking in whatever it happened to capture.
 */
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
  'Pagination',
  'FloatingActionButton',
  'StepIndicator',
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
