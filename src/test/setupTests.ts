import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

afterEach(() => {
  vi.restoreAllMocks()
})
