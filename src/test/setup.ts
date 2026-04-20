import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'

// Guard against any test accidentally hitting the real sync API.
// Individual tests can override `global.fetch` via `vi.spyOn(global, 'fetch')`.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error(
        'Unexpected fetch in test. Stub global.fetch in the test before triggering a network call.',
      )
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
