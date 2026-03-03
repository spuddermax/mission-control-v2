import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { RouterOutputs } from '@/utils/trpc'

import { TaskCard } from './TaskCard'
import { TaskListSkeleton } from './TaskListSkeleton'

type Task = RouterOutputs['tasks']['list']['items'][number]

type TaskListProps = {
  tasks: Task[]
  isInitialLoading: boolean
  isRefetching: boolean
  isFetchingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskList({
  tasks,
  isInitialLoading,
  isRefetching,
  isFetchingMore,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (isInitialLoading) {
    return <TaskListSkeleton />
  }

  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-muted-foreground">
        No tasks yet. Create your first mission to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isRefetching && (
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refreshing…
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <div className="flex justify-center">
        {hasMore && (
          <Button variant="outline" size="sm" disabled={isFetchingMore} onClick={onLoadMore}>
            {isFetchingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </span>
            ) : (
              'Load more'
            )}
          </Button>
        )}
        {!hasMore && !!tasks.length && (
          <p className="text-sm text-muted-foreground">You have reached the end.</p>
        )}
      </div>
    </div>
  )
}
