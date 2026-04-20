import { PageHeader } from '../../../shared/ui/page-header'
import { Stat } from '../../../shared/ui/stat'
import type { Integration } from '../../../shared/types/domain'

interface IntegrationsOverviewProps {
  integrations: Integration[]
}

export function IntegrationsOverview({
  integrations,
}: IntegrationsOverviewProps) {
  const syncedCount = integrations.filter((item) => item.status === 'synced').length
  const issueCount = integrations.filter(
    (item) => item.status === 'error' || item.status === 'conflict',
  ).length
  const totalConflicts = integrations.reduce(
    (sum, integration) => sum + integration.pendingConflicts,
    0,
  )

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Integration sync control panel"
        description="Track provider health, inspect incoming changes, and resolve field-level conflicts before applying them."
      />

      <section className="stats-grid">
        <Stat
          label="Connected integrations"
          value={integrations.length}
          hint="Across CRM, workspace, and billing systems"
        />
        <Stat
          label="Healthy syncs"
          value={syncedCount}
          hint="Running without intervention"
        />
        <Stat
          label="Requires review"
          value={issueCount}
          hint="Conflict or error states"
        />
        <Stat
          label="Pending field conflicts"
          value={totalConflicts}
          hint="Manual decisions required"
        />
      </section>
    </>
  )
}
