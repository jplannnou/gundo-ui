import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/__snapshots__/{arg}{ext}',

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    /* ─── Visual regression tests (local harness) ─────────────── */
    {
      name: 'visual',
      testDir: './e2e/visual',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4173',
        animations: 'disabled',
      },
    },

    /* ─── Accessibility tests (real browser axe-core) ───────────── */
    {
      name: 'a11y',
      testDir: './e2e/a11y',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4173',
      },
    },

    /* ─── Deployed app smoke tests ────────────────────────────── */
    {
      name: 'finance',
      testDir: './e2e',
      testMatch: 'smoke.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // The deploy target is the `gundo-finance-app` Hosting site, not the
        // orphaned project-default `gundo-finance.web.app` (which serves a stale
        // bundle and is never updated by deploys).
        baseURL: 'https://gundo-finance-app.web.app',
      },
    },
    {
      name: 'radar',
      testDir: './e2e',
      testMatch: 'smoke.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://gundo-radar.web.app',
      },
    },
    {
      name: 'jp-assistant',
      testDir: './e2e',
      testMatch: 'smoke.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://jp-assistant-app.web.app',
      },
    },
    {
      name: 'engine',
      testDir: './e2e',
      testMatch: 'smoke.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://gundo-engine.vercel.app',
      },
    },
  ],

  /* ─── Local dev server for visual tests ─────────────────────── */
  webServer: {
    // BUILD + preview, never the dev server (TD-011). Dev injects component CSS
    // via JS after first paint, leaving a window where everything renders
    // unstyled — and since toHaveScreenshot stops at the first frame that
    // matches, a baseline captured in that window keeps matching broken frames
    // forever. That is how 41 of 60 baselines ended up wrong (TD-010). A build
    // ships the CSS as a blocking <link>, so there is no unstyled frame to catch.
    command:
      'npx vite build --config e2e/visual/vite.config.ts && npx vite preview --config e2e/visual/vite.config.ts',
    port: 4173,
    timeout: 180_000, // the build runs before the port opens
    reuseExistingServer: !process.env.CI,
  },
});
