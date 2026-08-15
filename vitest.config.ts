import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    // `scripts/**` entra en la suite a propósito: ahí vive la guarda que
    // impide que un consumidor vuelva a instalar dos copias del DS. Un check
    // que no corre en CI no es una guarda.
    include: ['src/**/*.test.tsx', 'src/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
});
