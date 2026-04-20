import { Clock3, Database } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDateTime, formatRelativeTime } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/card'
import { StatusIndicator } from '../../../shared/ui/status-indicator'
import type { Integration } from '../../../shared/types/domain'

interface IntegrationCardProps {
  integration: Integration
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  return (
    <Card className="integration-card">
      <Link
        className="integration-card__link"
        to={`/integrations/${integration.id}`}
        aria-label={`Open ${integration.name} integration details`}
      >
        <div className="integration-card__top">
          <div>
            <div className="integration-card__heading-row">
              <h3>{integration.name}</h3>
              <StatusIndicator status={integration.status} />
            </div>
            <p>{integration.description}</p>
          </div>
        </div>

        <dl className="integration-card__meta">
          <div>
            <dt>
              <Database size={14} aria-hidden="true" focusable="false" /> Category
            </dt>
            <dd>{integration.category}</dd>
          </div>
          <div>
            <dt>
              <Clock3 size={14} aria-hidden="true" focusable="false" /> Last sync
            </dt>
            <dd>
              <time dateTime={integration.lastSyncAt} title={formatDateTime(integration.lastSyncAt)}>
              {formatRelativeTime(integration.lastSyncAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{integration.version}</dd>
          </div>
          <div>
            <dt>Coverage</dt>
            <dd>{integration.entityCoverage.join(", ")}</dd>
          </div>
        </dl>
      </Link>
    </Card>
  )
}
