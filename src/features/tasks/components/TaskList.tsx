import { Button } from '@/components/ui/button'
import type { RouterOutputs } from '@/types/trpc'

import { TaskCard } from './TaskCard'

type Task = RouterOutputs['tasks']['list']['items'][number]

type TaskListProps = {
  tasks: Task[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskList({
  tasks,
  isLoading,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (!tasks.length && !isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-muted-foreground">
        No tasks yet. Create your first mission to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <div className="flex justify-center">
        {hasMore && (
          <Button variant="outline" size="sm" disabled={isLoading} onClick={onLoadMore}>
            {isLoading ? 'Loading…' : 'Load more'}
          </Button>
        )}
        {!hasMore && !!tasks.length && (
          <p className="text-sm text-muted-foreground">You have reached the end.</p>
        )}
      </div>
    </div>
  )
}
