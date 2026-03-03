import { defineConfig, devices } from '@playwright/test'

const HOST = process.env.PLAYWRIGHT_TEST_HOST ?? '127.0.0.1'
const PREVIEW_PORT = Number(process.env.MCP_PREVIEW_PORT ?? 4173)
const SERVER_PORT = Number(process.env.MCP_SERVER_PORT ?? 3001)
const BASE_URL = `http://${HOST}:${PREVIEW_PORT}`
const DB_PATH = process.env.PLAYWRIGHT_DB_PATH ?? 'tmp/e2e.db.sqlite'

export default defineConfig({
  testDir: './playwright',
  timeout: 120_000,
  expect: {
    timeout: 5_000,
  },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'dot' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `rm -f ${DB_PATH} && MCP_SERVER_PORT=${SERVER_PORT} MCP_DB_PATH=${DB_PATH} npx tsx src/server/index.ts`,
      url: `http://127.0.0.1:${SERVER_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `MCP_API_TARGET=http://127.0.0.1:${SERVER_PORT} MCP_PREVIEW_PORT=${PREVIEW_PORT} npm run preview -- --host ${HOST} --port ${PREVIEW_PORT}`,
      url: `http://${HOST}:${PREVIEW_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
})
