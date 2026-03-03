import { createTRPCRouter } from './trpc'
import { tasksRouter } from './routers/tasks'

export const appRouter = createTRPCRouter({
  tasks: tasksRouter,
})

export type AppRouter = typeof appRouter
