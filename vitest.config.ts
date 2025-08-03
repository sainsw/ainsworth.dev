import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      'app': path.resolve(__dirname, './app'),
      '@': path.resolve(__dirname, './'),
    },
  },
  css: {
    modules: {
      classNameStrategy: 'non-scoped',
    },
  },
})