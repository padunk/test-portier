import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset)
    }

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__inner">
          <p className="error-boundary__eyebrow">Something went wrong</p>
          <h1>The sync panel hit an unexpected error</h1>
          <p>
            The interface ran into a problem it could not recover from. You can
            try again, or reload the page if the issue persists.
          </p>
          <details>
            <summary>Technical details</summary>
            <pre>{error.message}</pre>
          </details>
          <div className="error-boundary__actions">
            <button type="button" className="button" onClick={this.reset}>
              Try again
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    )
  }
}
