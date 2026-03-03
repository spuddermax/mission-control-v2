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
    <section className="panel filters">
      <div>
        <p className="filters__label">Status</p>
        <div className="filters__chip-row">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={['chip', value.status.includes(option.value) && 'chip--active']
                .filter(Boolean)
                .join(' ')}
              onClick={() => toggleStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="filters__label">Priority</p>
        <div className="filters__chip-row">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={['chip', value.priority.includes(option.value) && 'chip--active']
                .filter(Boolean)
                .join(' ')}
              onClick={() => togglePriority(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="filters__label">Assignee ID</p>
        <input
          type="number"
          className="input"
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
    </section>
  )
}
