import { and, desc, eq, isNull } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '../trpc'
import type { DatabaseClient } from '../db'
import { tasks, taskStatuses } from '../db/schema'

const listInput = z.object({
  limit: z.number().int().positive().max(100).optional(),
  cursor: z.number().int().positive().optional(),
  filter: z
    .object({
      status: z.array(z.enum(taskStatuses)).optional(),
      priority: z.array(z.number().int()).optional(),
      assigneeId: z.number().int().optional(),
      creatorId: z.number().int().optional(),
    })
    .optional(),
})

const createInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.number().int().min(0).max(5).optional(),
  assigneeAgentId: z.number().int().optional().nullable(),
  createdByAgentId: z.number().int().optional().nullable(),
})

const updateInput = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.number().int().min(0).max(5).optional(),
  assigneeAgentId: z.number().int().nullable().optional(),
  updatedByAgentId: z.number().int().nullable().optional(),
})

const deleteInput = z.object({
  id: z.number().int().positive(),
  updatedByAgentId: z.number().int().nullable().optional(),
})

export const tasksRouter = createTRPCRouter({
  list: publicProcedure.input(listInput).query(async ({ ctx, input }) => {
    const limit = Math.min(input.limit ?? 20, 100)

    const rows = await ctx.db.query.tasks.findMany({
      where: (task, { and, eq, inArray, isNull, lt }) => {
        const clauses = [isNull(task.deletedAt)]
        if (input.cursor) clauses.push(lt(task.id, input.cursor))
        if (input.filter?.status?.length) clauses.push(inArray(task.status, input.filter.status))
        if (input.filter?.priority?.length)
          clauses.push(inArray(task.priority, input.filter.priority))
        if (input.filter?.assigneeId)
          clauses.push(eq(task.assigneeAgentId, input.filter.assigneeId))
        if (input.filter?.creatorId) clauses.push(eq(task.createdByAgentId, input.filter.creatorId))

        return clauses.length ? and(...clauses) : undefined
      },
      orderBy: (task, { desc }) => desc(task.id),
      limit: limit + 1,
      with: {
        creator: true,
        assignee: true,
        notes: {
          where: (note, { isNull }) => isNull(note.deletedAt),
          orderBy: (note) => desc(note.createdAt),
          limit: 5,
        },
      },
    })

    let nextCursor: number | undefined
    if (rows.length > limit) {
      const nextItem = rows.pop()
      nextCursor = nextItem?.id
    }

    return {
      items: rows,
      nextCursor,
    }
  }),

  create: publicProcedure.input(createInput).mutation(async ({ ctx, input }) => {
    const [record] = await ctx.db
      .insert(tasks)
      .values({
        title: input.title,
        description: input.description,
        status: input.status ?? 'todo',
        priority: input.priority ?? 0,
        createdByAgentId: input.createdByAgentId ?? null,
        assigneeAgentId: input.assigneeAgentId ?? null,
        updatedByAgentId: input.createdByAgentId ?? null,
      })
      .returning({ id: tasks.id })

    const task = await fetchTaskById(ctx.db, record.id)
    if (!task) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load inserted task',
      })
    }
    return task
  }),

  update: publicProcedure.input(updateInput).mutation(async ({ ctx, input }) => {
    const updateData = {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assigneeAgentId !== undefined
        ? { assigneeAgentId: input.assigneeAgentId ?? null }
        : {}),
      ...(input.updatedByAgentId !== undefined
        ? { updatedByAgentId: input.updatedByAgentId ?? null }
        : {}),
      updatedAt: new Date().toISOString(),
    }

    const updateQuery = ctx.db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, input.id), isNull(tasks.deletedAt)))

    const updated = await updateQuery.returning({ id: tasks.id })

    if (!updated.length) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
    }

    const task = await fetchTaskById(ctx.db, updated[0].id)
    if (!task) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
    }
    return task
  }),

  delete: publicProcedure.input(deleteInput).mutation(async ({ ctx, input }) => {
    const deleted = await ctx.db
      .update(tasks)
      .set({
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedByAgentId: input.updatedByAgentId ?? null,
      })
      .where(and(eq(tasks.id, input.id), isNull(tasks.deletedAt)))
      .returning({ id: tasks.id })

    return { success: deleted.length > 0 }
  }),
})

async function fetchTaskById(db: DatabaseClient, id: number) {
  return db.query.tasks.findFirst({
    where: (task, { and, eq, isNull }) => and(eq(task.id, id), isNull(task.deletedAt)),
    with: {
      creator: true,
      assignee: true,
      notes: {
        where: (note, { isNull }) => isNull(note.deletedAt),
        orderBy: (note) => desc(note.createdAt),
        limit: 5,
      },
    },
  })
}
