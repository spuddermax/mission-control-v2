import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { createExpressMiddleware } from '@trpc/server/adapters/express'

import { migrateToLatest } from './db'
import { appRouter, createTRPCContext } from './trpc'

const app = express()

const corsOrigin = process.env.MCP_CORS_ORIGIN
const allowedOrigins = corsOrigin ? corsOrigin.split(',').map((origin) => origin.trim()) : undefined

app.use(cors({ origin: allowedOrigins ?? true }))
app.use(helmet())
app.use(compression())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  }),
)

const port = Number(process.env.MCP_SERVER_PORT ?? 3001)

async function start() {
  await migrateToLatest()

  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.warn(`[server] listening on http://localhost:${port}`)
      resolve()
    })
  })
}

start().catch((error) => {
  console.error('[server] failed to start', error)
  process.exit(1)
})

export type { AppRouter } from './trpc'
export { app }
