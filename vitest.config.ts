import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    exclude: [
      'e2e/**', // Playwright specs — handled by Playwright, not Vitest
      'node_modules/**',
      'dist/**',
    ],
  },
  resolve: {
    alias: {
      app: path.resolve(__dirname, './app'),
      '@': path.resolve(__dirname, './'),
    },
  },
});
