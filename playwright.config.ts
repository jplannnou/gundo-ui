import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,

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
      },
    },

    /* ─── Deployed app smoke tests ────────────────────────────── */
    {
      name: 'finance',
      testDir: './e2e',
      testMatch: 'smoke.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://gundo-finance.web.app',
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
    command: 'npx vite --config e2e/visual/vite.config.ts',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
