import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DeleteTaskDialogProps = {
  open: boolean
  taskTitle?: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

export function DeleteTaskDialog({ open, taskTitle, onClose, onConfirm }: DeleteTaskDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose()
    }
  }

  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
          <DialogDescription>
            This action is irreversible. {taskTitle ? `“${taskTitle}”` : 'This task'} will be
            removed for all operators.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
