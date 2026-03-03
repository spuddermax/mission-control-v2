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
    return <div className="empty-state">No tasks yet. Create your first mission.</div>
  }

  return (
    <div>
      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <div className="task-grid__footer">
        {hasMore && (
          <button type="button" className="btn" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading…' : 'Load more'}
          </button>
        )}
        {!hasMore && !!tasks.length && <p className="task-grid__end">You have reached the end.</p>}
      </div>
    </div>
  )
}
