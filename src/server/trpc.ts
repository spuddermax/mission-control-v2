import { randomUUID } from 'node:crypto'

import { initTRPC, TRPCError } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { ZodError } from 'zod'

import { db } from './db'

type TrpcContext = {
  db: typeof db
  requestId: string
}

export const createTRPCContext = ({ req }: CreateExpressContextOptions): TrpcContext => {
  const requestId = req.header('x-request-id') ?? randomUUID()
  return {
    db,
    requestId,
  }
}

const t = initTRPC.context<TrpcContext>().create({
  errorFormatter({ error, shape, ctx }) {
    return {
      ...shape,
      message: error.message,
      data: {
        ...shape.data,
        requestId: ctx?.requestId,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

export type AppRouterContext = TrpcContext

export class NotFoundError extends TRPCError {
  constructor(message = 'Resource not found') {
    super({ code: 'NOT_FOUND', message })
  }
}
