import type { RouterOutputs } from '@/types/trpc'

const statusColorMap: Record<string, string> = {
  todo: 'badge badge--muted',
  'in-progress': 'badge badge--primary',
  blocked: 'badge badge--danger',
  done: 'badge badge--success',
}

const priorityLabels: Record<number, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
  3: 'Critical',
  4: 'Critical',
  5: 'Critical',
}

type Task = RouterOutputs['tasks']['list']['items'][number]

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="card">
      <div className="card__header">
        <div>
          <p className="card__title">{task.title}</p>
          <p className="card__meta">
            Created by {task.creator?.name ?? 'Unknown'} · Assigned to{' '}
            {task.assignee?.name ?? 'Unassigned'}
          </p>
        </div>
        <div className="card__badges">
          <span className={statusColorMap[task.status] ?? 'badge'}>{task.status}</span>
          <span className="badge badge--muted">
            {priorityLabels[task.priority] ?? `P${task.priority}`}
          </span>
        </div>
      </div>
      {task.description && <p className="card__description">{task.description}</p>}
      {task.notes.length > 0 && (
        <div className="card__notes">
          {task.notes.map((note) => (
            <div key={note.id} className="card__note">
              <p className="card__note-text">{note.content}</p>
              <p className="card__note-meta">
                {note.createdByAgentId ? `Agent ${note.createdByAgentId}` : 'Unknown'} ·{' '}
                {new Date(note.createdAt ?? '').toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="card__actions">
        <button type="button" className="btn btn--ghost" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="btn btn--ghost-danger" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </div>
  )
}
