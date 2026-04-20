import { AlertCircle } from 'lucide-react'

interface SyncErrorBannerProps {
  title: string
  detail: string
}

export function SyncErrorBanner({ title, detail }: SyncErrorBannerProps) {
  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      <AlertCircle size={18} aria-hidden="true" focusable="false" />
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  )
}
