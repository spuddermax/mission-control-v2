import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))
const enableHttps = process.env.MCP_HTTPS === 'true'
const apiTarget = process.env.MCP_API_TARGET ?? 'http://localhost:3001'
const devPort = Number(process.env.MCP_VITE_PORT ?? 5173)
const previewPort = Number(process.env.MCP_PREVIEW_PORT ?? 4173)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  server: {
    host: '0.0.0.0',
    port: devPort,
    https: enableHttps,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: previewPort,
    https: enableHttps,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
