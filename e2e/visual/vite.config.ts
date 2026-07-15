import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  // Without this the components render with colour but no layout — see harness.css.
  plugins: [tailwindcss()],
  server: {
    port: 4173,
    strictPort: true,
  },
  // The visual suite serves a BUILT harness, not the dev server (TD-011). In dev
  // every `import './ui-classes.css'` is injected by JS after first paint, so
  // there is a window where components render unstyled — and `toHaveScreenshot`
  // stops at the first frame that MATCHES, so a baseline recorded in that window
  // matches an early broken frame forever (that is exactly what happened, see
  // TD-010). A build emits the CSS as a blocking <link>: no unstyled window to
  // record. Keep this in sync with playwright.config.ts's webServer.
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    // Deterministic pixels beat byte-size here: minification can shift text
    // rendering, and the baselines are compared at 100px tolerance.
    minify: false,
  },
  resolve: {
    alias: {
      '@gundo/ui': resolve(__dirname, '../../src'),
    },
  },
});
