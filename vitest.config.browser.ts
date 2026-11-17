import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import tailwindcss from '@tailwindcss/vite';

// Real-browser (Chromium) run. jsdom implements none of the Popover API,
// <dialog>.showModal() or CSS anchor positioning, so the native overlays are
// only provable here. Run with `pnpm test:browser`.
export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
    setupFiles: ['./src/__tests__/setup-browser.ts'],
    // Only the real-browser files. a11y.test.tsx stays in the jsdom suite:
    // vitest-axe needs Node (`createRequire`) and cannot be bundled for Chromium.
    include: ['src/__tests__/*.browser.test.tsx'],
  },
});
