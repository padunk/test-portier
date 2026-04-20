import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './layout'
import { IntegrationDetailPage } from '../pages/integration-detail-page'
import { IntegrationsPage } from '../pages/integrations-page'

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <IntegrationsPage />,
        },
        {
          path: 'integrations/:integrationId',
          element: <IntegrationDetailPage />,
        },
        {
          path: '*',
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ])
}
