import { IntegrationCard } from '../features/integrations/components/integration-card'
import { IntegrationsOverview } from '../features/integrations/components/integrations-overview'
import { useSyncStore } from '../store/sync-store'

export function IntegrationsPage() {
  const integrations = useSyncStore((state) => state.integrations)

  return (
    <div className="page-stack">
      <IntegrationsOverview integrations={integrations} />

      <ul className="grid-two-col integrations-grid" aria-label="Integrations list">
        {integrations.map((integration) => (
          <li key={integration.id} className="integrations-grid__item">
            <IntegrationCard integration={integration} />
          </li>
        ))}
      </ul>
    </div>
  )
}
