import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  root: __dirname,
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@gundo/ui': path.resolve(__dirname, '../src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
