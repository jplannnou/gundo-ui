import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
    setupFiles: ['./src/__tests__/setup-browser.ts'],
    include: ['src/__tests__/a11y.test.tsx'],
  },
});
