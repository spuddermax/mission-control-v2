import { CalendarClock, UserRound } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { RouterOutputs } from '@/types/trpc'

const statusClasses: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  blocked: 'bg-rose-100 text-rose-700',
  done: 'bg-emerald-100 text-emerald-700',
}

const priorityLabels: Record<number, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
  3: 'Critical',
  4: 'Critical',
  5: 'Critical',
}

const priorityClasses: Record<number, string> = {
  0: 'bg-slate-100 text-slate-700',
  1: 'bg-amber-100 text-amber-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-red-100 text-red-700',
}

type Task = RouterOutputs['tasks']['list']['items'][number]

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const statusBadge = statusClasses[task.status] ?? 'bg-slate-100 text-slate-700'
  const priorityBadge = priorityClasses[task.priority] ?? 'bg-slate-100 text-slate-700'

  return (
    <Card className="backdrop-blur">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl">{task.title}</CardTitle>
          <CardDescription>
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              <span>
                {task.creator?.name ?? 'Unknown'} → {task.assignee?.name ?? 'Unassigned'}
              </span>
            </span>
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={cn('text-xs font-semibold capitalize', statusBadge)}>
            {task.status}
          </Badge>
          <Badge className={cn('text-xs font-semibold', priorityBadge)}>
            {priorityLabels[task.priority] ?? `P${task.priority}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && <p className="text-sm text-foreground/90">{task.description}</p>}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
          <span>{new Date(task.createdAt ?? '').toLocaleString()}</span>
        </div>
        {task.notes.length > 0 && (
          <div className="space-y-3 rounded-lg border border-slate-100/60 bg-slate-50/80 p-3">
            {task.notes.map((note, index) => (
              <div key={note.id} className="space-y-1 text-sm">
                <p>{note.content}</p>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">
                    {note.createdByAgentId ? `Agent ${note.createdByAgentId}` : 'Unknown agent'}
                  </span>{' '}
                  · {new Date(note.createdAt ?? '').toLocaleString()}
                </div>
                {index < task.notes.length - 1 && <Separator className="bg-slate-200" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-600 hover:text-rose-600"
          onClick={() => onDelete(task)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
