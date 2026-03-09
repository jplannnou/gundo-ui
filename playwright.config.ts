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
    {
      name: 'finance',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://gundo-finance.web.app',
      },
    },
    {
      name: 'radar',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://gundo-radar.web.app',
      },
    },
    {
      name: 'jp-assistant',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://jp-assistant-app.web.app',
      },
    },
    {
      name: 'engine',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://gundo-engine.vercel.app',
      },
    },
  ],
});
