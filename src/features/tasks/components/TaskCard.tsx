import type { ComponentType } from 'react'

import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Flame,
  Loader2,
  OctagonAlert,
  Sparkles,
  UserRound,
} from 'lucide-react'

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
import type { RouterOutputs } from '@/utils/trpc'

type Task = RouterOutputs['tasks']['list']['items'][number]

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const statusThemes: Record<
  string,
  { className: string; Icon: ComponentType<{ className?: string }> }
> = {
  todo: { className: 'bg-blue-50 text-blue-700', Icon: CircleDashed },
  'in-progress': { className: 'bg-sky-50 text-sky-700', Icon: Loader2 },
  blocked: { className: 'bg-rose-50 text-rose-700', Icon: OctagonAlert },
  done: { className: 'bg-emerald-50 text-emerald-700', Icon: CheckCircle2 },
}

const priorityThemes: Record<
  number,
  { className: string; label: string; Icon: ComponentType<{ className?: string }> }
> = {
  0: { className: 'bg-slate-100 text-slate-700', label: 'Low', Icon: Sparkles },
  1: { className: 'bg-amber-50 text-amber-700', label: 'Medium', Icon: Sparkles },
  2: { className: 'bg-orange-50 text-orange-700', label: 'High', Icon: Flame },
  3: { className: 'bg-red-50 text-red-700', label: 'Critical', Icon: Flame },
  4: { className: 'bg-red-50 text-red-700', label: 'Critical', Icon: Flame },
  5: { className: 'bg-red-50 text-red-700', label: 'Critical', Icon: Flame },
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const statusTheme = statusThemes[task.status] ?? statusThemes.todo
  const priorityTheme = priorityThemes[task.priority] ?? priorityThemes[0]

  return (
    <Card className="backdrop-blur" data-testid="task-card">
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
          <Badge className={cn('text-xs font-semibold capitalize gap-1.5', statusTheme.className)}>
            <statusTheme.Icon
              className={cn('h-3.5 w-3.5', task.status === 'in-progress' && 'animate-spin')}
            />
            {task.status.replace('-', ' ')}
          </Badge>
          <Badge className={cn('text-xs font-semibold gap-1.5', priorityTheme.className)}>
            <priorityTheme.Icon className="h-3.5 w-3.5" />
            {priorityTheme.label ?? `P${task.priority}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && <p className="text-sm text-foreground/90">{task.description}</p>}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="icon-chip icon-chip--muted icon-chip--sm">
              <CalendarClock className="h-3.5 w-3.5" />
            </span>
            <span>{new Date(task.createdAt ?? '').toLocaleString()}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="icon-chip icon-chip--muted icon-chip--sm">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span>{task.notes.length} recent notes</span>
          </span>
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
