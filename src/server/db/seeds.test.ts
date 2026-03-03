import { afterAll, describe, expect, test } from 'vitest'

import { agents, taskNotes, tasks } from './schema'
import {
  baseAgentSeeds,
  baseTaskNoteSeeds,
  baseTaskSeeds,
  createTestDatabase,
  seedDatabase,
} from './seeds'

function createIsolatedDb() {
  const { sqlite, db } = createTestDatabase()
  return {
    db,
    cleanup: () => sqlite.close(),
  }
}

describe('seedDatabase', () => {
  const cleanups: Array<() => void> = []

  afterAll(() => {
    cleanups.forEach((fn) => fn())
  })

  test('populates baseline agents, tasks, and notes', async () => {
    const { db, cleanup } = createIsolatedDb()
    cleanups.push(cleanup)

    await seedDatabase(db)

    const agentRows = await db.select().from(agents)
    const taskRows = await db.select().from(tasks)
    const noteRows = await db.select().from(taskNotes)

    expect(agentRows).toHaveLength(baseAgentSeeds.length)
    expect(taskRows).toHaveLength(baseTaskSeeds.length)
    expect(noteRows).toHaveLength(baseTaskNoteSeeds.length)

    const hasAssignedTasks = taskRows.some((task) => task.assigneeAgentId !== null)
    expect(hasAssignedTasks).toBe(true)
  })

  test('clears previous data before re-seeding', async () => {
    const { db, cleanup } = createIsolatedDb()
    cleanups.push(cleanup)

    await seedDatabase(db)

    // Insert an extra row that should be removed by the next seed run.
    await db.insert(tasks).values({
      title: 'Temporary task',
      description: 'Should be deleted by seeds',
      priority: 0,
      status: 'todo',
    })

    const countBefore = (await db.select().from(tasks)).length
    expect(countBefore).toBe(baseTaskSeeds.length + 1)

    await seedDatabase(db)

    const agentRows = await db.select().from(agents)
    const taskRows = await db.select().from(tasks)

    expect(agentRows).toHaveLength(baseAgentSeeds.length)
    expect(taskRows).toHaveLength(baseTaskSeeds.length)
    expect(taskRows.every((task) => task.deletedAt === null)).toBe(true)
  })
})
