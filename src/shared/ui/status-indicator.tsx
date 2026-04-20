import { Badge } from './badge'
import { sentenceCase } from '../lib/format'
import type { HistoryEventStatus, IntegrationStatus } from '../types/domain'

interface StatusIndicatorProps {
  status: IntegrationStatus | HistoryEventStatus
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const tone =
    status === 'synced' || status === 'success'
      ? 'success'
      : status === 'syncing'
        ? 'info'
        : status === 'conflict' || status === 'warning'
          ? 'warning'
          : 'danger'

  return <Badge tone={tone} ariaLabel={`Status: ${sentenceCase(status)}`}>{sentenceCase(status)}</Badge>
}
