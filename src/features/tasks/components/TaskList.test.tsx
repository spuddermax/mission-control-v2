import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { TaskList } from './TaskList'
import type { RouterOutputs } from '@/utils/trpc'

type Task = RouterOutputs['tasks']['list']['items'][number]

const baseTimestamp = new Date('2026-03-03T12:00:00.000Z').toISOString()

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Sample task',
    description: 'Ensure TaskList renders entries',
    status: 'todo',
    priority: 1,
    createdByAgentId: 1,
    assigneeAgentId: null,
    updatedByAgentId: null,
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
    deletedAt: null,
    creator: {
      id: 1,
      name: 'Max MCP',
      status: 'working',
      preferredModel: 'gpt-5.1-codex',
      createdAt: baseTimestamp,
      updatedAt: baseTimestamp,
      updatedByAgentId: null,
      deletedAt: null,
    },
    assignee: null,
    notes: [],
    ...overrides,
  }
}

describe('TaskList', () => {
  test('shows skeleton while initial data loads', () => {
    render(
      <TaskList
        tasks={[]}
        isInitialLoading
        isRefetching={false}
        isFetchingMore={false}
        hasMore={false}
        onLoadMore={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    )

    expect(screen.getByRole('status', { name: /loading tasks/i })).toBeInTheDocument()
  })

  test('renders empty state when no tasks exist after load', () => {
    render(
      <TaskList
        tasks={[]}
        isInitialLoading={false}
        isRefetching={false}
        isFetchingMore={false}
        hasMore={false}
        onLoadMore={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    )

    expect(screen.getByText(/no tasks yet/i)).toBeVisible()
  })

  test('lists tasks and forwards interactions', () => {
    const onLoadMore = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <TaskList
        tasks={[createTask(), createTask({ id: 2, title: 'Second task' })]}
        isInitialLoading={false}
        isRefetching={false}
        isFetchingMore={false}
        hasMore
        onLoadMore={onLoadMore}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /load more/i }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0])
    expect(onEdit).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0])
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
