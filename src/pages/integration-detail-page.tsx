import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ConflictResolutionPanel } from '../features/conflicts/components/conflict-resolution-panel'
import { SyncHistoryPanel } from '../features/history/components/sync-history-panel'
import { SyncErrorBanner } from '../features/sync/components/sync-error-banner'
import { SyncPreviewPanel } from '../features/sync/components/sync-preview-panel'
import {
  getSyncErrorCopy,
  useSyncPreview,
} from '../features/sync/hooks/use-sync-preview'
import { formatDateTime, sentenceCase } from '../shared/lib/format'
import { Badge } from '../shared/ui/badge'
import { Card } from '../shared/ui/card'
import { PageHeader } from '../shared/ui/page-header'
import { StatusIndicator } from '../shared/ui/status-indicator'
import type {
  ConflictItem,
  IntegrationId,
  SyncEvent,
} from '../shared/types/domain'
import { useSyncStore } from '../store/sync-store'

const VALID_INTEGRATION_IDS: ReadonlyArray<IntegrationId> = [
  'salesforce',
  'hubspot',
  'slack',
  'stripe',
]
const EMPTY_CONFLICTS: ConflictItem[] = []
const EMPTY_HISTORY: SyncEvent[] = []

function isIntegrationId(value: string | undefined): value is IntegrationId {
  return typeof value === 'string' && (VALID_INTEGRATION_IDS as readonly string[]).includes(value)
}

export function IntegrationDetailPage() {
  const { integrationId: rawIntegrationId } = useParams<{ integrationId: string }>()
  const integrationId = isIntegrationId(rawIntegrationId) ? rawIntegrationId : undefined

  const integration = useSyncStore((state) =>
    integrationId ? state.integrations.find((item) => item.id === integrationId) : undefined,
  )

  if (!integration || !integrationId) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Integration not found"
          description="Choose one of the configured integrations from the overview screen."
        />
        <Link className="text-link back-to" to="/">
          <ArrowLeft size={16} aria-hidden="true" focusable="false" />
          Back to integrations
        </Link>
      </div>
    )
  }

  return <IntegrationDetailView integrationId={integrationId} />
}

interface IntegrationDetailViewProps {
  integrationId: IntegrationId
}

function IntegrationDetailView({ integrationId }: IntegrationDetailViewProps) {
  const integration = useSyncStore((state) =>
    state.integrations.find((item) => item.id === integrationId),
  )!
  const preview = useSyncStore((state) => state.previews[integrationId])
  const conflicts = useSyncStore(
    (state) => state.conflicts[integrationId] ?? EMPTY_CONFLICTS,
  )
  const history = useSyncStore(
    (state) => state.history[integrationId] ?? EMPTY_HISTORY,
  )
  const chooseResolution = useSyncStore((state) => state.chooseResolution)
  const applyResolutions = useSyncStore((state) => state.applyResolutions)

  const mutation = useSyncPreview(integrationId)
  const errorCopy = mutation.error ? getSyncErrorCopy(mutation.error) : null

  return (
    <div className="page-stack">
      <Link className="text-link back-to" to="/">
        <ArrowLeft size={16} aria-hidden="true" focusable="false" />
        Back to integrations
      </Link>

      <PageHeader
        eyebrow={integration.category}
        title={`${integration.name} sync workspace`}
        description={integration.description}
        actions={<StatusIndicator status={integration.status} />}
      />

      <section className="detail-grid" aria-label={`${integration.name} details`}>
        <Card className="summary-card">
          <div className="panel-header">
            <div>
              <p className="panel-header__eyebrow">Integration summary</p>
              <h2>Current sync posture</h2>
            </div>
            <Badge tone="outline">{integration.version}</Badge>
          </div>

          <dl className="summary-list">
            <div>
              <dt>Status</dt>
              <dd>{sentenceCase(integration.status)}</dd>
            </div>
            <div>
              <dt>Last sync</dt>
              <dd>
                <time dateTime={integration.lastSyncAt}>
                  {formatDateTime(integration.lastSyncAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt>Entity coverage</dt>
              <dd>{integration.entityCoverage.join(', ')}</dd>
            </div>
            <div>
              <dt>Pending conflicts</dt>
              <dd>{integration.pendingConflicts}</dd>
            </div>
          </dl>
        </Card>

        {errorCopy ? (
          <SyncErrorBanner
            title={errorCopy.title}
            detail={errorCopy.detail}
            status={errorCopy.status}
          />
        ) : null}

        <SyncPreviewPanel
          preview={preview}
          isLoading={mutation.isPending}
          onSyncNow={() => {
            void mutation.mutateAsync().catch(() => {
              // Error state is surfaced via mutation.error / SyncErrorBanner.
            })
          }}
        />

        <ConflictResolutionPanel
          conflicts={conflicts}
          onChooseResolution={(conflictId, resolution) =>
            chooseResolution(integrationId, conflictId, resolution)
          }
          onApply={() => applyResolutions(integrationId)}
        />

        <SyncHistoryPanel events={history} />
      </section>
    </div>
  )
}
