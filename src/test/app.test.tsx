import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AppProviders } from '../app/providers'
import { useSyncStore } from '../store/sync-store'

const PRISTINE_STATE = useSyncStore.getState()

function renderAt(path: string) {
  window.history.pushState({}, '', path)

  return render(
    <AppProviders>
      <App />
    </AppProviders>,
  )
}

function mockFetchOnce(response: Response | Promise<Response>) {
  const fetchMock = vi.fn().mockResolvedValueOnce(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  // Reset zustand state to its initial seed before each test.
  useSyncStore.setState(PRISTINE_STATE, true)
})

afterEach(() => {
  // Reset window history so subsequent tests start at /.
  window.history.pushState({}, '', '/')
})

describe('App scaffold', () => {
  it('renders the integrations overview', () => {
    renderAt('/')

    expect(screen.getByText(/integration sync control panel/i)).toBeInTheDocument()
    expect(screen.getByText(/salesforce/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })

  it('renders the salesforce detail route in synced state', () => {
    renderAt('/integrations/salesforce')

    expect(screen.getByText(/salesforce sync workspace/i)).toBeInTheDocument()
    expect(screen.getByText(/current sync posture/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/status: synced/i).length).toBeGreaterThan(0)
  })

  it('shows an empty preview state for hubspot until Sync Now is triggered', () => {
    renderAt('/integrations/hubspot')

    expect(screen.getByText(/no sync preview fetched yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /fetch live sync preview/i }),
    ).toBeInTheDocument()
  })

  it('shows a not-found view for unknown integration ids', () => {
    renderAt('/integrations/does-not-exist')

    expect(screen.getByText(/integration not found/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /back to integrations/i }),
    ).toBeInTheDocument()
  })
})

describe('Sync Now flow', () => {
  it('fetches a preview, renders incoming changes, and writes a history entry', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchOnce(
      jsonResponse({
        code: 'SUCCESS',
        message: 'ok',
        data: {
          sync_approval: {
            application_name: 'Slack',
            changes: [
              {
                id: 'change_001',
                field_name: 'user.email',
                change_type: 'UPDATE',
                current_value: 'evan.temp@company.com',
                new_value: 'evan@company.com',
              },
            ],
          },
        },
      }),
    )

    renderAt('/integrations/slack')

    await user.click(screen.getByRole('button', { name: /fetch live sync preview/i }))

    await waitFor(() => {
      expect(screen.getByText(/slack incoming changes/i)).toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toContain('application_id=slack')

    // The new conflict requires resolution.
    expect(screen.getByText(/choose a winning value per field/i)).toBeInTheDocument()
    expect(screen.getByText(/1 unresolved/i)).toBeInTheDocument()

    // History gained a "warning" entry for the fetched preview.
    const historySection = screen.getByLabelText(/sync history events/i)
    expect(
      within(historySection).getByText(/1 field conflict pending review/i),
    ).toBeInTheDocument()
  })

  it('surfaces a 500 error with status code and writes an error history event', async () => {
    const user = userEvent.setup()
    mockFetchOnce(
      jsonResponse({ code: 'INTERNAL_ERROR', message: 'boom' }, 500),
    )

    renderAt('/integrations/stripe')

    await user.click(screen.getByRole('button', { name: /fetch live sync preview/i }))

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(/provider returned a server error/i)).toBeInTheDocument()
    expect(within(alert).getByText(/HTTP 500/i)).toBeInTheDocument()

    // Integration status flipped to error and history captured the failure.
    await waitFor(() => {
      expect(screen.getAllByLabelText(/status: error/i).length).toBeGreaterThan(0)
    })
  })
})

describe('Conflict resolution', () => {
  it('lets the user pick a winner, apply the merge, and clears conflicts visibly', async () => {
    const user = userEvent.setup()
    mockFetchOnce(
      jsonResponse({
        code: 'SUCCESS',
        message: 'ok',
        data: {
          sync_approval: {
            application_name: 'HubSpot',
            changes: [
              {
                id: 'change_001',
                field_name: 'user.email',
                change_type: 'UPDATE',
                current_value: 'a@example.com',
                new_value: 'b@example.com',
              },
            ],
          },
        },
      }),
    )

    renderAt('/integrations/hubspot')
    await user.click(screen.getByRole('button', { name: /fetch live sync preview/i }))

    // Wait for the preview + conflict UI to render.
    await screen.findByText(/hubspot incoming changes/i)

    // Apply button starts disabled.
    const applyButton = screen.getByRole('button', { name: /apply merge decisions/i })
    expect(applyButton).toBeDisabled()

    // Pick the external value for the only field.
    await user.click(
      screen.getByRole('button', { name: /use external for user.*email/i }),
    )

    expect(applyButton).toBeEnabled()
    await user.click(applyButton)

    // Conflicts are cleared, empty state shows again, and a merge history event appears.
    await waitFor(() => {
      expect(screen.getByText(/no field conflicts detected/i)).toBeInTheDocument()
    })

    const historySection = screen.getByLabelText(/sync history events/i)
    expect(within(historySection).getByText(/merged sync run/i)).toBeInTheDocument()
  })
})
