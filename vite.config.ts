import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { PreviewOptions, ServerOptions } from 'vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const srcPath = fileURLToPath(new URL('./src', import.meta.url))
const enableHttps = process.env.MCP_HTTPS === 'true'
const apiTarget = process.env.MCP_API_TARGET ?? 'http://localhost:3001'
const devPort = Number(process.env.MCP_VITE_PORT ?? 5173)
const previewPort = Number(process.env.MCP_PREVIEW_PORT ?? 4173)

const buildHttpsConfig = () => {
  const certPath = process.env.MCP_HTTPS_CERT ?? 'certs/mcp.lan.pem'
  const keyPath = process.env.MCP_HTTPS_KEY ?? 'certs/mcp.lan-key.pem'
  const resolvedCertPath = resolve(projectRoot, certPath)
  const resolvedKeyPath = resolve(projectRoot, keyPath)

  if (existsSync(resolvedCertPath) && existsSync(resolvedKeyPath)) {
    return {
      cert: readFileSync(resolvedCertPath),
      key: readFileSync(resolvedKeyPath),
    }
  }

  throw new Error(
    `HTTPS requested via MCP_HTTPS=true, but missing cert/key at ${certPath} and ${keyPath}. ` +
      'Generate them with mkcert (see README).',
  )
}

const httpsConfig = enableHttps ? buildHttpsConfig() : undefined

const serverConfig: ServerOptions = {
  host: '0.0.0.0',
  port: devPort,
  https: httpsConfig,
  proxy: {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
    },
  },
}

const previewConfig: PreviewOptions = {
  host: '0.0.0.0',
  port: previewPort,
  https: httpsConfig,
  proxy: {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
    },
  },
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  server: serverConfig,
  preview: previewConfig,
})
