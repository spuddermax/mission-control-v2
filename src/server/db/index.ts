import fs from 'node:fs'
import path from 'node:path'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import * as schema from './schema'

const DEFAULT_DB_PATH = path.resolve(process.cwd(), 'db.sqlite')
const DEFAULT_MIGRATIONS_DIR = path.resolve(process.cwd(), 'drizzle')

const dbFile = process.env.MCP_DB_PATH ?? DEFAULT_DB_PATH
const migrationsDir = process.env.MCP_MIGRATIONS_DIR ?? DEFAULT_MIGRATIONS_DIR

fs.mkdirSync(path.dirname(dbFile), { recursive: true })

const sqlite = new Database(dbFile)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

export async function migrateToLatest() {
  migrate(db, { migrationsFolder: migrationsDir })
}

export function getDatabaseFile() {
  return dbFile
}

export type DatabaseClient = typeof db
