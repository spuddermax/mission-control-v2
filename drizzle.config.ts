import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.MCP_DB_PATH ?? './db.sqlite',
  },
  strict: true,
  verbose: true,
})
