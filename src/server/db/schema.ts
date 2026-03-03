import { relations, sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const agentStatuses = ['idle', 'working', 'blocked'] as const
export type AgentStatus = (typeof agentStatuses)[number]

export const taskStatuses = ['todo', 'in-progress', 'blocked', 'done'] as const
export type TaskStatus = (typeof taskStatuses)[number]

export const agents = sqliteTable(
  'agents',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    status: text('status', { enum: agentStatuses }).notNull().default('idle'),
    preferredModel: text('preferred_model').default('grok-4'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedByAgentId: integer('updated_by_agent_id'),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    nameIdx: uniqueIndex('agents_name_unique').on(table.name),
  }),
)

export const tasks = sqliteTable(
  'tasks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: taskStatuses }).notNull().default('todo'),
    priority: integer('priority').notNull().default(0),
    createdByAgentId: integer('created_by_agent_id').references(() => agents.id, {
      onDelete: 'set null',
    }),
    assigneeAgentId: integer('assignee_agent_id').references(() => agents.id, {
      onDelete: 'set null',
    }),
    updatedByAgentId: integer('updated_by_agent_id').references(() => agents.id, {
      onDelete: 'set null',
    }),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    statusPriorityIdx: index('tasks_status_priority_idx').on(
      table.status,
      table.priority,
      table.createdAt,
    ),
    assigneeIdx: index('tasks_assignee_idx').on(table.assigneeAgentId),
    createdByIdx: index('tasks_created_by_idx').on(table.createdByAgentId),
  }),
)

export const taskNotes = sqliteTable(
  'task_notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    taskId: integer('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdByAgentId: integer('created_by_agent_id').references(() => agents.id, {
      onDelete: 'set null',
    }),
    updatedByAgentId: integer('updated_by_agent_id').references(() => agents.id, {
      onDelete: 'set null',
    }),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    taskIdx: index('task_notes_task_id_idx').on(table.taskId, table.createdAt),
  }),
)

export const agentsRelations = relations(agents, ({ many }) => ({
  createdTasks: many(tasks, { relationName: 'createdTasks' }),
  assignedTasks: many(tasks, { relationName: 'assignedTasks' }),
  taskNotesAuthored: many(taskNotes, { relationName: 'taskNoteAuthors' }),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(agents, {
    fields: [tasks.createdByAgentId],
    references: [agents.id],
    relationName: 'createdTasks',
  }),
  assignee: one(agents, {
    fields: [tasks.assigneeAgentId],
    references: [agents.id],
    relationName: 'assignedTasks',
  }),
  updatedBy: one(agents, {
    fields: [tasks.updatedByAgentId],
    references: [agents.id],
  }),
  notes: many(taskNotes),
}))

export const taskNotesRelations = relations(taskNotes, ({ one }) => ({
  task: one(tasks, {
    fields: [taskNotes.taskId],
    references: [tasks.id],
  }),
  author: one(agents, {
    fields: [taskNotes.createdByAgentId],
    references: [agents.id],
    relationName: 'taskNoteAuthors',
  }),
  updatedBy: one(agents, {
    fields: [taskNotes.updatedByAgentId],
    references: [agents.id],
  }),
}))

export type Agent = typeof agents.$inferSelect
export type InsertAgent = typeof agents.$inferInsert
export type Task = typeof tasks.$inferSelect
export type InsertTask = typeof tasks.$inferInsert
export type TaskNote = typeof taskNotes.$inferSelect
export type InsertTaskNote = typeof taskNotes.$inferInsert
