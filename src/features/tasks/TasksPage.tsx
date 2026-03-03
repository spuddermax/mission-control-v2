import { useMemo, useState } from 'react'
import type { InfiniteData } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import type { RouterInputs, RouterOutputs } from '@/utils/trpc'
import { trpc } from '@/utils/trpc'

import { DeleteTaskDialog } from './components/DeleteTaskDialog'
import { TaskFilters, type TaskFiltersValue } from './components/TaskFilters'
import { TaskFormModal, type TaskFormValues } from './components/TaskFormModal'
import { TaskList } from './components/TaskList'

type Task = RouterOutputs['tasks']['list']['items'][number]

type FilterState = TaskFiltersValue

const defaultFilters: FilterState = {
  status: [],
  priority: [],
}

const DEFAULT_AUTHOR_ID = 1
const PAGE_SIZE = 20

export function TasksPage() {
  const utils = trpc.useUtils()
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const queryInput = useMemo<RouterInputs['tasks']['list']>(() => {
    const filter = normalizeFilters(filters)
    return filter ? { limit: PAGE_SIZE, filter } : { limit: PAGE_SIZE }
  }, [filters])

  const infiniteOptions: Parameters<typeof trpc.tasks.list.useInfiniteQuery>[1] = {
    getNextPageParam: (lastPage: RouterOutputs['tasks']['list']) =>
      lastPage.nextCursor ?? undefined,
  }

  const tasksQuery = trpc.tasks.list.useInfiniteQuery(queryInput, infiniteOptions)

  if (tasksQuery.status === 'error') {
    throw tasksQuery.error
  }

  const tasksPages = tasksQuery.data as InfiniteData<RouterOutputs['tasks']['list']> | undefined

  const tasks = useMemo(() => tasksPages?.pages.flatMap((page) => page.items) ?? [], [tasksPages])

  const isInitialLoading = tasksQuery.status === 'pending'
  const isFetchingMore = tasksQuery.isFetchingNextPage
  const isRefetching = tasksQuery.isFetching && !isFetchingMore && !isInitialLoading

  const createMutation = trpc.tasks.create.useMutation({
    async onMutate(input) {
      await utils.tasks.list.cancel(queryInput)
      const previousData = utils.tasks.list.getInfiniteData(queryInput)
      const optimisticTask = buildOptimisticTask(input)

      utils.tasks.list.setInfiniteData(queryInput, (data) =>
        prependTaskToCache(data, optimisticTask),
      )

      return { previousData, optimisticId: optimisticTask.id }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        utils.tasks.list.setInfiniteData(queryInput, context.previousData)
      }
    },
    onSuccess: (task, _variables, context) => {
      utils.tasks.list.setInfiniteData(queryInput, (data) =>
        replaceOrInsertTask(data, context?.optimisticId ?? task.id, task),
      )
    },
    onSettled: () => {
      utils.tasks.list.invalidate(queryInput)
    },
  })

  const updateMutation = trpc.tasks.update.useMutation({
    async onMutate(input) {
      await utils.tasks.list.cancel(queryInput)
      const previousData = utils.tasks.list.getInfiniteData(queryInput)

      utils.tasks.list.setInfiniteData(queryInput, (data) =>
        mapTaskInCache(data, input.id, (task) => ({
          ...task,
          title: input.title ?? task.title,
          description: input.description ?? task.description,
          status: input.status ?? task.status,
          priority: input.priority ?? task.priority,
          assigneeAgentId:
            input.assigneeAgentId !== undefined ? input.assigneeAgentId : task.assigneeAgentId,
          updatedByAgentId:
            input.updatedByAgentId !== undefined ? input.updatedByAgentId : task.updatedByAgentId,
          updatedAt: new Date().toISOString(),
        })),
      )

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        utils.tasks.list.setInfiniteData(queryInput, context.previousData)
      }
    },
    onSuccess: (task) => {
      utils.tasks.list.setInfiniteData(queryInput, (data) =>
        mapTaskInCache(data, task.id, () => task),
      )
    },
    onSettled: () => {
      utils.tasks.list.invalidate(queryInput)
    },
  })

  const deleteMutation = trpc.tasks.delete.useMutation({
    async onMutate(input) {
      await utils.tasks.list.cancel(queryInput)
      const previousData = utils.tasks.list.getInfiniteData(queryInput)

      utils.tasks.list.setInfiniteData(queryInput, (data) => removeTaskFromCache(data, input.id))

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        utils.tasks.list.setInfiniteData(queryInput, context.previousData)
      }
    },
    onSettled: () => {
      utils.tasks.list.invalidate(queryInput)
    },
  })

  const handleCreate = async (values: TaskFormValues) => {
    await createMutation.mutateAsync({
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      assigneeAgentId: values.assigneeAgentId ?? null,
      createdByAgentId: DEFAULT_AUTHOR_ID,
    })
  }

  const handleUpdate = async (values: TaskFormValues) => {
    if (!editingTask) return
    await updateMutation.mutateAsync({
      id: editingTask.id,
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      assigneeAgentId: values.assigneeAgentId ?? null,
      updatedByAgentId: DEFAULT_AUTHOR_ID,
    })
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    await deleteMutation.mutateAsync({ id: deletingTask.id, updatedByAgentId: DEFAULT_AUTHOR_ID })
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="page__title">Tasks</p>
          <p className="page__subtitle">Monitor and command every agent mission.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>New Task</Button>
      </div>

      <TaskFilters value={filters} onChange={setFilters} />

      <TaskList
        tasks={tasks}
        isInitialLoading={isInitialLoading}
        isRefetching={isRefetching}
        isFetchingMore={isFetchingMore}
        hasMore={Boolean(tasksQuery.hasNextPage)}
        onLoadMore={() => tasksQuery.fetchNextPage()}
        onEdit={(task) => setEditingTask(task)}
        onDelete={(task) => setDeletingTask(task)}
      />

      <TaskFormModal
        mode="create"
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <TaskFormModal
        mode="edit"
        open={Boolean(editingTask)}
        task={editingTask ?? undefined}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdate}
      />

      <DeleteTaskDialog
        open={Boolean(deletingTask)}
        taskTitle={deletingTask?.title}
        isConfirming={deleteMutation.isPending}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function normalizeFilters(
  filters: FilterState,
): RouterInputs['tasks']['list']['filter'] | undefined {
  const next: RouterInputs['tasks']['list']['filter'] = {}

  if (filters.status.length) {
    next.status = filters.status
  }
  if (filters.priority.length) {
    next.priority = filters.priority
  }
  if (filters.assigneeId !== undefined && filters.assigneeId !== null) {
    next.assigneeId = Number(filters.assigneeId)
  }

  return Object.keys(next).length ? next : undefined
}

type TasksInfiniteData = InfiniteData<RouterOutputs['tasks']['list']>

function prependTaskToCache(data: TasksInfiniteData | undefined, task: Task) {
  if (!data) {
    return data
  }
  return {
    ...data,
    pages: data.pages.map((page, index) =>
      index === 0 ? { ...page, items: [task, ...page.items] } : page,
    ),
  }
}

function mapTaskInCache(
  data: TasksInfiniteData | undefined,
  taskId: number,
  mapper: (task: Task) => Task,
) {
  if (!data) return data
  let found = false
  const nextData = {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((task) => {
        if (task.id === taskId) {
          found = true
          return mapper(task)
        }
        return task
      }),
    })),
  }
  return found ? nextData : data
}

function replaceOrInsertTask(data: TasksInfiniteData | undefined, lookupId: number, task: Task) {
  if (!data) return data
  let found = false
  const nextData = {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((existing) => {
        if (existing.id === lookupId) {
          found = true
          return task
        }
        return existing
      }),
    })),
  }
  return found ? nextData : prependTaskToCache(nextData, task)
}

function removeTaskFromCache(data: TasksInfiniteData | undefined, taskId: number) {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((task) => task.id !== taskId),
    })),
  }
}

let optimisticIdCursor = -1

function buildOptimisticTask(input: RouterInputs['tasks']['create']): Task {
  optimisticIdCursor -= 1
  const timestamp = new Date().toISOString()

  return {
    id: optimisticIdCursor,
    title: input.title,
    description: input.description ?? '',
    status: input.status ?? 'todo',
    priority: input.priority ?? 0,
    createdByAgentId: input.createdByAgentId ?? DEFAULT_AUTHOR_ID,
    assigneeAgentId: input.assigneeAgentId ?? null,
    updatedByAgentId: input.createdByAgentId ?? DEFAULT_AUTHOR_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    creator: null,
    assignee: null,
    notes: [],
  }
}
