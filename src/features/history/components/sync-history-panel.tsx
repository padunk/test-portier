import { formatDateTime } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/card'
import { EmptyState } from '../../../shared/ui/empty-state'
import { StatusIndicator } from '../../../shared/ui/status-indicator'
import type { SyncEvent } from '../../../shared/types/domain'

interface SyncHistoryPanelProps {
  events: SyncEvent[]
}

export function SyncHistoryPanel({ events }: SyncHistoryPanelProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No sync history yet"
        description="Each preview, merge, and error event will appear in this timeline."
      />
    )
  }

  return (
    <Card aria-labelledby="sync-history-title">
      <div className="panel-header">
        <div>
          <p className="panel-header__eyebrow">History & versioning</p>
          <h2 id="sync-history-title">Recent sync events</h2>
          <p>Inspect when a sync ran, who approved it, and which version snapshot was created.</p>
        </div>
      </div>

      <ul className="timeline" aria-label="Sync history events">
        {events.map((event) => (
          <li key={event.id} className="timeline__item">
            <div className="timeline__row">
              <div>
                <div className="list-row__title-row">
                  <strong>{event.summary}</strong>
                  <StatusIndicator status={event.status} />
                </div>
                <p className="muted-text">
                  <time dateTime={event.timestamp}>{formatDateTime(event.timestamp)}</time> • {event.actor}
                </p>
              </div>
              <div className="timeline__meta">
                <span>{event.version}</span>
                <span>{event.changeCount} changes</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
