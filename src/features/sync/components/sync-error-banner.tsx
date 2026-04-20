import { AlertCircle } from 'lucide-react'

interface SyncErrorBannerProps {
  title: string
  detail: string
  status?: number
}

export function SyncErrorBanner({ title, detail, status }: SyncErrorBannerProps) {
  const showStatus = typeof status === 'number' && status > 0

  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      <AlertCircle size={18} aria-hidden="true" focusable="false" />
      <div>
        <strong>
          {title}
          {showStatus ? <span className="error-banner__status"> · HTTP {status}</span> : null}
        </strong>
        <p>{detail}</p>
      </div>
    </div>
  )
}
