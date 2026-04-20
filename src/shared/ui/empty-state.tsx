import { useId, type ReactNode } from 'react'
import { Card } from './card'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <Card
      className="empty-state"
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div>
        <h3 id={titleId}>{title}</h3>
        <p id={descriptionId}>{description}</p>
      </div>
      {action}
    </Card>
  )
}
