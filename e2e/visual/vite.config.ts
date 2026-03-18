import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  server: {
    port: 4173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@gundo/ui': resolve(__dirname, '../../src'),
    },
  },
});
