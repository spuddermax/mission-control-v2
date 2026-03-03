import { useMemo, useState } from 'react'

import type { RouterOutputs } from '@/types/trpc'
import { trpc } from '@/lib/trpc'

import { DeleteTaskDialog } from './components/DeleteTaskDialog'
import { TaskFilters } from './components/TaskFilters'
import { TaskFormModal, type TaskFormValues } from './components/TaskFormModal'
import { TaskList } from './components/TaskList'

type Task = RouterOutputs['tasks']['list']['items'][number]

type FilterState = {
  status: string[]
  priority: number[]
  assigneeId?: number
}

const defaultFilters: FilterState = {
  status: [],
  priority: [],
}

const DEFAULT_AUTHOR_ID = 1

export function TasksPage() {
  const utils = trpc.useUtils()
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const tasksQuery = trpc.tasks.list.useInfiniteQuery(
    {
      limit: 20,
      filter: normalizeFilters(filters),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const tasks = useMemo(
    () => tasksQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [tasksQuery.data],
  )

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  })

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  })

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
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
        <button type="button" className="btn" onClick={() => setIsCreateOpen(true)}>
          New Task
        </button>
      </div>

      <TaskFilters value={filters} onChange={setFilters} />

      <TaskList
        tasks={tasks}
        isLoading={tasksQuery.isFetching}
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
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function normalizeFilters(filters: FilterState) {
  return {
    status: filters.status.length ? filters.status : undefined,
    priority: filters.priority.length ? filters.priority : undefined,
    assigneeId: filters.assigneeId ? Number(filters.assigneeId) : undefined,
  }
}
