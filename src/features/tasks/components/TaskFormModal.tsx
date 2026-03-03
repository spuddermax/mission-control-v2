import { useEffect, useState } from 'react'

import type { RouterOutputs } from '@/types/trpc'

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Done', value: 'done' },
]

type Task = RouterOutputs['tasks']['list']['items'][number]

export type TaskFormValues = {
  title: string
  description: string
  status: string
  priority: number
  assigneeAgentId?: number | null
}

type TaskFormModalProps = {
  mode: 'create' | 'edit'
  open: boolean
  task?: Task
  onClose: () => void
  onSubmit: (values: TaskFormValues) => Promise<void>
}

const defaultValues: TaskFormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 1,
  assigneeAgentId: null,
}

export function TaskFormModal({ mode, open, task, onClose, onSubmit }: TaskFormModalProps) {
  const [values, setValues] = useState<TaskFormValues>(defaultValues)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && task) {
        setValues({
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          assigneeAgentId: task.assigneeAgentId ?? null,
        })
      } else {
        setValues(defaultValues)
      }
      setError(null)
      setIsSaving(false)
    }
  }, [mode, open, task])

  if (!open) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal__overlay" role="dialog" aria-modal>
      <div className="modal">
        <div className="modal__header">
          <p className="modal__title">{mode === 'create' ? 'Create Task' : 'Edit Task'}</p>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal__body">
          <label className="modal__field">
            <span>Title</span>
            <input
              required
              className="input"
              value={values.title}
              onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>
          <label className="modal__field">
            <span>Description</span>
            <textarea
              className="textarea"
              rows={4}
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>
          <div className="modal__grid">
            <label className="modal__field">
              <span>Status</span>
              <select
                className="input"
                value={values.status}
                onChange={(event) => setValues((prev) => ({ ...prev, status: event.target.value }))}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="modal__field">
              <span>Priority</span>
              <input
                type="number"
                min={0}
                max={5}
                className="input"
                value={values.priority}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, priority: Number(event.target.value) }))
                }
              />
            </label>
            <label className="modal__field">
              <span>Assignee ID</span>
              <input
                type="number"
                className="input"
                value={values.assigneeAgentId ?? ''}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    assigneeAgentId: event.target.value ? Number(event.target.value) : null,
                  }))
                }
              />
            </label>
          </div>
          {error && <p className="modal__error">{error}</p>}
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
