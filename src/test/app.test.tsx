import { render, screen } from '@testing-library/react'
import App from '../App'
import { AppProviders } from '../app/providers'

describe('App scaffold', () => {
  it('renders the integrations overview', () => {
    window.history.pushState({}, '', '/')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByText(/integration sync control panel/i)).toBeInTheDocument()
    expect(screen.getByText(/salesforce/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })

  it('renders the salesforce detail route without update loop errors', () => {
    window.history.pushState({}, '', '/integrations/salesforce')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByText(/salesforce sync workspace/i)).toBeInTheDocument()
    expect(screen.getByText(/current sync posture/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status: syncing/i)).toBeInTheDocument()
  })

  it('renders the slack detail route without update loop errors', () => {
    window.history.pushState({}, '', '/integrations/slack')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByText(/slack sync workspace/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sync history events/i)).toBeInTheDocument()
  })

  it('renders the stripe detail route without update loop errors', () => {
    window.history.pushState({}, '', '/integrations/stripe')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByText(/stripe sync workspace/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fetch live sync preview/i })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: /no field conflicts detected/i })).toBeInTheDocument()
  })
})
