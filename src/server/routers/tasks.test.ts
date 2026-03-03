import { eq } from 'drizzle-orm'
import { describe, expect, test } from 'vitest'

import { appRouter } from '../router'
import { agents, tasks } from '../db/schema'
import { prepareSeededTestDb } from '../db/seeds'

async function createCaller() {
  const { db, cleanup } = await prepareSeededTestDb()
  const caller = appRouter.createCaller({ db, requestId: 'test-request' })
  return { db, cleanup, caller }
}

describe('tasksRouter', () => {
  test('list returns paginated tasks and filters out deleted rows', async () => {
    const { caller, db, cleanup } = await createCaller()

    try {
      const firstPage = await caller.tasks.list({ limit: 2 })

      expect(firstPage.items.length).toBeLessThanOrEqual(2)
      expect(firstPage.nextCursor).toBeDefined()

      // Soft delete one of the tasks and ensure it disappears from results.
      const toDelete = firstPage.items[0]
      await db
        .update(tasks)
        .set({ deletedAt: new Date().toISOString() })
        .where(eq(tasks.id, toDelete.id))

      const filtered = await caller.tasks.list({ limit: 10 })
      expect(filtered.items.some((task) => task.id === toDelete.id)).toBe(false)
    } finally {
      cleanup()
    }
  })

  test('create → update → delete round trip works with full payloads', async () => {
    const { caller, db, cleanup } = await createCaller()

    try {
      const [creator] = await db.select().from(agents).limit(1)
      expect(creator).toBeDefined()

      const created = await caller.tasks.create({
        title: 'Automated test task',
        description: 'Ensures tRPC mutations behave',
        priority: 2,
        status: 'in-progress',
        createdByAgentId: creator.id,
      })

      expect(created.id).toBeGreaterThan(0)
      expect(created.status).toBe('in-progress')

      const updated = await caller.tasks.update({
        id: created.id,
        status: 'done',
        priority: 3,
        updatedByAgentId: creator.id,
      })

      expect(updated.status).toBe('done')
      expect(updated.priority).toBe(3)

      const deleted = await caller.tasks.delete({ id: created.id, updatedByAgentId: creator.id })
      expect(deleted.success).toBe(true)

      const finalList = await caller.tasks.list({ limit: 50 })
      expect(finalList.items.find((task) => task.id === created.id)).toBeUndefined()
    } finally {
      cleanup()
    }
  })
})
