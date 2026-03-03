import { useState } from 'react'

type DeleteTaskDialogProps = {
  open: boolean
  taskTitle?: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function DeleteTaskDialog({ open, taskTitle, onConfirm, onClose }: DeleteTaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete task')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="modal__overlay" role="dialog" aria-modal>
      <div className="modal">
        <div className="modal__header">
          <p className="modal__title">Delete task</p>
        </div>
        <div className="modal__body">
          <p>
            Are you sure you want to delete “{taskTitle ?? 'this task'}”? This action is reversible.
          </p>
          {error && <p className="modal__error">{error}</p>}
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete task'}
          </button>
        </div>
      </div>
    </div>
  )
}
