import { useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { TaskFilters } from './TaskFilters'

type FilterState = Parameters<typeof TaskFilters>[0]['value']

function FiltersHarness({ initialValue }: { initialValue?: FilterState }) {
  const [filters, setFilters] = useState<FilterState>(
    initialValue ?? { status: [], priority: [], assigneeId: undefined },
  )

  return (
    <div>
      <TaskFilters value={filters} onChange={setFilters} />
      <pre data-testid="filters-state">{JSON.stringify(filters)}</pre>
    </div>
  )
}

describe('TaskFilters', () => {
  test('toggles status and priority chips', () => {
    render(<FiltersHarness />)

    fireEvent.click(screen.getByRole('button', { name: /to do/i }))
    fireEvent.click(screen.getByRole('button', { name: /high/i }))

    expect(screen.getByTestId('filters-state').textContent).toContain('"status":["todo"]')
    expect(screen.getByTestId('filters-state').textContent).toContain('"priority":[2]')

    // Toggle again to remove selections.
    fireEvent.click(screen.getByRole('button', { name: /to do/i }))
    fireEvent.click(screen.getByRole('button', { name: /high/i }))

    expect(screen.getByTestId('filters-state').textContent).toContain('"status":[]')
    expect(screen.getByTestId('filters-state').textContent).toContain('"priority":[]')
  })

  test('updates assignee id field', () => {
    render(<FiltersHarness />)

    const input = screen.getByRole('spinbutton', { name: /assignee id/i })
    fireEvent.change(input, { target: { value: '5' } })

    expect(screen.getByTestId('filters-state').textContent).toContain('"assigneeId":5')

    fireEvent.change(input, { target: { value: '' } })
    expect(screen.getByTestId('filters-state').textContent).not.toContain('assigneeId')
  })
})
