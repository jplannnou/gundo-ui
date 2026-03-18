import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: './',
  root: __dirname,
  plugins: [tailwindcss()],
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
