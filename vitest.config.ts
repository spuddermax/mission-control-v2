import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig, configDefaults } from 'vitest/config'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./src/test/setupTests.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: [...configDefaults.coverage.exclude, 'src/test/**/*'],
    },
  },
})
