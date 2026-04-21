import { ChevronRight, RefreshCcw } from 'lucide-react'
import {
  extractEntityContext,
  formatDateTime,
  formatFieldName,
  formatValue,
} from '../../../shared/lib/format'
import { Badge } from '../../../shared/ui/badge'
import { Card } from '../../../shared/ui/card'
import { EmptyState } from '../../../shared/ui/empty-state'
import type { SyncPreview } from '../../../shared/types/domain'

interface SyncPreviewPanelProps {
  preview?: SyncPreview
  onSyncNow: () => void
  isLoading?: boolean
}

export function SyncPreviewPanel({
  preview,
  onSyncNow,
  isLoading,
}: SyncPreviewPanelProps) {
  if (!preview) {
    return (
      <EmptyState
        title="No sync preview fetched yet"
        description="Trigger Sync Now to request the latest preview from the integration API."
        action={
          <button
            className="button button--primary"
            onClick={onSyncNow}
            type="button"
            disabled={isLoading}
            aria-busy={isLoading ? 'true' : undefined}
            aria-label={isLoading ? 'Fetching live sync preview' : 'Fetch live sync preview'}
          >
            <RefreshCcw
              size={16}
              className={isLoading ? 'spin' : undefined}
              aria-hidden="true"
              focusable="false"
            />
            {isLoading ? 'Syncing…' : 'Sync Now'}
          </button>
        }
      />
    )
  }

  return (
    <Card aria-labelledby="sync-preview-title">
      <div className="panel-header">
        <div>
          <p className="panel-header__eyebrow">Sync preview</p>
          <h2 id="sync-preview-title">{preview.applicationName} incoming changes</h2>
          <p>
            Fetched {formatDateTime(preview.fetchedAt)}. Review before applying
            any merge decision.
          </p>
        </div>

        <button
          className="button button--primary"
          onClick={onSyncNow}
          type="button"
          disabled={isLoading}
          aria-label={isLoading ? 'Refreshing sync preview' : 'Refresh sync preview'}
          aria-busy={isLoading ? 'true' : undefined}
        >
          <RefreshCcw
            size={16}
            className={isLoading ? 'spin' : undefined}
            aria-hidden="true"
            focusable="false"
          />
          {isLoading ? 'Refreshing…' : 'Sync Now'}
        </button>
      </div>

      <ul className="list-stack" aria-label="Incoming sync changes">
        {preview.changes.map((change) => (
          <li key={change.id} className="list-row list-row--change">
            <div>
              <div className="list-row__title-row">
                <strong>{formatFieldName(change.fieldName)}</strong>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-fg-subtle)', marginLeft: '0.5rem' }}>
                  {extractEntityContext(preview.changes, change.fieldName)}
                </span>
                <Badge tone="outline" ariaLabel={`Change type: ${change.changeType}`}>
                  {change.changeType}
                </Badge>
              </div>
              <div className="change-values">
                <div>
                  <span>Current</span>
                  <strong>{formatValue(change.currentValue)}</strong>
                </div>
                <ChevronRight size={16} aria-hidden="true" focusable="false" />
                <div>
                  <span>Incoming</span>
                  <strong>{formatValue(change.newValue)}</strong>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
