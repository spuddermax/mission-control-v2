import { Filter } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Done', value: 'done' },
]

const priorityOptions = [
  { label: 'Low', value: 0 },
  { label: 'Medium', value: 1 },
  { label: 'High', value: 2 },
  { label: 'Critical', value: 3 },
]

type Filters = {
  status: string[]
  priority: number[]
  assigneeId?: number | null
}

type TaskFiltersProps = {
  value: Filters
  onChange: (value: Filters) => void
}

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  const toggleStatus = (status: string) => {
    const next = value.status.includes(status)
      ? value.status.filter((item) => item !== status)
      : [...value.status, status]
    onChange({ ...value, status: next })
  }

  const togglePriority = (priority: number) => {
    const next = value.priority.includes(priority)
      ? value.priority.filter((item) => item !== priority)
      : [...value.priority, priority]
    onChange({ ...value, priority: next })
  }

  return (
    <Card className="backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <span className="icon-chip icon-chip--accent icon-chip--sm">
            <Filter className="h-3.5 w-3.5" />
          </span>
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={value.status.includes(option.value) ? 'default' : 'outline'}
                size="sm"
                className={cn('rounded-full px-3', value.status.includes(option.value) && 'shadow')}
                onClick={() => toggleStatus(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Priority
          </p>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={value.priority.includes(option.value) ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'rounded-full px-3',
                  value.priority.includes(option.value) && 'shadow',
                )}
                onClick={() => togglePriority(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label
            htmlFor="task-filter-assignee"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Assignee ID
          </Label>
          <Input
            id="task-filter-assignee"
            type="number"
            placeholder="Any"
            value={value.assigneeId ?? ''}
            onChange={(event) =>
              onChange({
                ...value,
                assigneeId: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          />
        </div>
        {(value.status.length > 0 || value.priority.length > 0 || value.assigneeId) && (
          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            {value.status.map((status) => (
              <Badge key={`status-${status}`} variant="outline" className="capitalize">
                {status}
              </Badge>
            ))}
            {value.priority.map((priority) => (
              <Badge key={`priority-${priority}`} variant="outline">
                P{priority}
              </Badge>
            ))}
            {value.assigneeId && <Badge variant="outline">Agent {value.assigneeId}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
