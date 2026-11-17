import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const here = import.meta.dirname;

export default defineConfig({
  base: './',
  root: here,
  plugins: [tailwindcss()],
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@gundo/ui': path.resolve(here, '../src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rolldownOptions: {
      // The library's `'use client'` marks RSC boundaries for CONSUMERS' bundlers.
      // In this standalone SPA it has no meaning, and Rolldown would repeat the
      // warning once per module, burying real ones.
      onLog(level, log, handler) {
        if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
        handler(level, log);
      },
    },
  },
});
