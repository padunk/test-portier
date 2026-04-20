import type { SyncPreview } from '../../../shared/types/domain'

export const mockSyncPreviews: SyncPreview[] = [
  {
    integrationId: 'hubspot',
    applicationName: 'HubSpot',
    fetchedAt: '2026-04-20T07:42:00Z',
    changes: [
      {
        id: 'change_001',
        fieldName: 'user.phone',
        changeType: 'UPDATE',
        currentValue: '+44 20 1234 5678',
        newValue: '+44 20 9876 5432',
      },
      {
        id: 'change_002',
        fieldName: 'user.status',
        changeType: 'UPDATE',
        currentValue: 'active',
        newValue: 'suspended',
      },
      {
        id: 'change_009',
        fieldName: 'user.email',
        changeType: 'UPDATE',
        currentValue: 'jane@acmeltd.com',
        newValue: 'jane@acmeglobal.com',
      },
      {
        id: 'change_010',
        fieldName: 'user.id',
        changeType: 'ADD',
        currentValue: null,
        newValue: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      },
      {
        id: 'change_013',
        fieldName: 'key.id',
        changeType: 'DELETE',
        currentValue: 'e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b',
        newValue: null,
      },
    ],
  },
]
