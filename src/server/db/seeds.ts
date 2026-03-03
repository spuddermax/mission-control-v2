import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { db as appDb } from './index'
import type { DatabaseClient } from './index'
import * as schema from './schema'
import type { TaskStatus } from './schema'

type SeedTask = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: number
  creator: string
  assignee?: string
}

type SeedTaskNote = {
  taskTitle: string
  author: string
  content: string
}

export const baseAgentSeeds = [
  { name: 'Max MCP', status: 'working', preferredModel: 'gpt-5.1-codex' },
  { name: 'Ops Monitor', status: 'idle', preferredModel: 'grok-4' },
  { name: 'Brief Writer', status: 'idle', preferredModel: 'gpt-4.1' },
  { name: 'Code Runner', status: 'working', preferredModel: 'gpt-5.1-codex' },
] as const

export const baseTaskSeeds: SeedTask[] = [
  {
    title: 'Wire database layer',
    description: 'Implement Drizzle schema + seeding helpers for agents/tasks/notes.',
    status: 'in-progress',
    priority: 2,
    creator: 'Max MCP',
    assignee: 'Code Runner',
  },
  {
    title: 'Draft task API contract',
    description: 'Define tRPC routers for list/create/update/delete.',
    status: 'todo',
    priority: 1,
    creator: 'Brief Writer',
    assignee: 'Ops Monitor',
  },
  {
    title: 'Polish Linear-style UI',
    description: 'Implement sidebar + task cards with shadcn components.',
    status: 'blocked',
    priority: 0,
    creator: 'Max MCP',
  },
]

export const baseTaskNoteSeeds: SeedTaskNote[] = [
  {
    taskTitle: 'Wire database layer',
    author: 'Code Runner',
    content: 'Need decisions on task priority scale before finalizing enum.',
  },
  {
    taskTitle: 'Wire database layer',
    author: 'Max MCP',
    content: "Let's keep priority as integer for now so frontend can map labels.",
  },
  {
    taskTitle: 'Draft task API contract',
    author: 'Brief Writer',
    content: 'Waiting on DB schema to finalize filter params.',
  },
]

export async function seedDatabase(client: DatabaseClient = appDb) {
  await client.delete(schema.taskNotes)
  await client.delete(schema.tasks)
  await client.delete(schema.agents)

  const insertedAgents = await client
    .insert(schema.agents)
    .values(baseAgentSeeds)
    .returning({ id: schema.agents.id, name: schema.agents.name })

  const agentNameToId = new Map(insertedAgents.map((agent) => [agent.name, agent.id]))
  const requireAgentId = (name: string) => {
    const id = agentNameToId.get(name)
    if (!id) {
      throw new Error(`Seed data missing agent named "${name}"`)
    }
    return id
  }

  const insertedTasks = await client
    .insert(schema.tasks)
    .values(
      baseTaskSeeds.map((task) => ({
        title: task.title,
        description: task.description,
        status: task.status ?? 'todo',
        priority: task.priority ?? 0,
        createdByAgentId: requireAgentId(task.creator),
        assigneeAgentId: task.assignee ? requireAgentId(task.assignee) : null,
      })),
    )
    .returning({ id: schema.tasks.id, title: schema.tasks.title })

  const taskTitleToId = new Map(insertedTasks.map((task) => [task.title, task.id]))
  const requireTaskId = (title: string) => {
    const id = taskTitleToId.get(title)
    if (!id) {
      throw new Error(`Seed data missing task titled "${title}"`)
    }
    return id
  }

  if (baseTaskNoteSeeds.length > 0) {
    await client.insert(schema.taskNotes).values(
      baseTaskNoteSeeds.map((note) => {
        const authorId = agentNameToId.get(note.author) ?? null
        return {
          taskId: requireTaskId(note.taskTitle),
          content: note.content,
          createdByAgentId: authorId,
          updatedByAgentId: authorId,
        }
      }),
    )
  }
}

export function createTestDatabase(filename = ':memory:') {
  const sqlite = new Database(filename)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  return { sqlite, db }
}

export async function prepareSeededTestDb() {
  const { sqlite, db } = createTestDatabase()
  await seedDatabase(db)
  return {
    sqlite,
    db,
    cleanup: () => sqlite.close(),
  }
}
