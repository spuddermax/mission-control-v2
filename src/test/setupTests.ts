import { afterEach, beforeEach, expect, vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import '@testing-library/jest-dom/vitest'

expect.extend(matchers)

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

afterEach(() => {
  vi.restoreAllMocks()
})
