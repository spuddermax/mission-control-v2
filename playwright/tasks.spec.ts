import { expect, test } from '@playwright/test'

const STATUS_CREATE = 'In Progress'
const STATUS_EDIT = 'Done'

function uniqueTaskTitle() {
  return `Playwright Smoke ${new Date().toISOString()}`
}

test('create, edit, and delete a task via the UI', async ({ page }) => {
  const initialTitle = uniqueTaskTitle()
  const editedTitle = `${initialTitle} (edited)`

  await page.goto('/')
  await page.getByText('New Task', { exact: true }).click()

  const createDialog = page.getByRole('dialog', { name: 'Create Task' })

  await createDialog.getByLabel('Title').fill(initialTitle)
  await createDialog.getByLabel('Description').fill('Created by the Playwright smoke test')

  await createDialog.getByTestId('status-select').click()
  await page.getByRole('option', { name: STATUS_CREATE }).click()

  await createDialog.getByLabel('Priority').fill('2')
  await createDialog.getByLabel('Assignee ID').fill('2')

  await createDialog.getByRole('button', { name: 'Save Task' }).click()

  const createdCard = page.getByTestId('task-card').filter({ hasText: initialTitle }).first()
  await expect(createdCard).toBeVisible()
  await expect(createdCard).toContainText(new RegExp(STATUS_CREATE, 'i'))

  await createdCard.getByRole('button', { name: 'Edit' }).click()

  const editDialog = page.getByRole('dialog', { name: 'Edit Task' })

  await editDialog.getByLabel('Title').fill(editedTitle)
  await editDialog.getByTestId('status-select').click()
  await page.getByRole('option', { name: STATUS_EDIT }).click()
  await editDialog.getByRole('button', { name: 'Save Task' }).click()

  const editedCard = page.getByTestId('task-card').filter({ hasText: editedTitle }).first()
  await expect(editedCard).toBeVisible()
  await expect(editedCard).toContainText(new RegExp(STATUS_EDIT, 'i'))

  await editedCard.getByRole('button', { name: 'Delete' }).click()
  const deleteDialog = page.getByRole('dialog', { name: 'Delete task' })
  await deleteDialog.getByRole('button', { name: 'Delete' }).click()

  await expect(page.getByTestId('task-card').filter({ hasText: editedTitle })).toHaveCount(0)
})
