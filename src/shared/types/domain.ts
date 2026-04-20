export type IntegrationId = 'salesforce' | 'hubspot' | 'slack' | 'stripe'

export type IntegrationStatus = 'synced' | 'syncing' | 'conflict' | 'error'

export type SyncChangeType = 'ADD' | 'UPDATE' | 'DELETE'

export type ConflictResolutionChoice = 'local' | 'external'

export type DomainEntity = 'User' | 'Door' | 'Key'

export type HistoryEventStatus = 'success' | 'warning' | 'error'

export interface Integration {
  id: IntegrationId
  name: string
  category: string
  status: IntegrationStatus
  description: string
  lastSyncAt: string
  version: string
  entityCoverage: DomainEntity[]
  pendingConflicts: number
}

export interface SyncChange {
  id: string
  fieldName: string
  changeType: SyncChangeType
  currentValue: string | null
  newValue: string | null
}

export interface SyncPreview {
  integrationId: IntegrationId
  applicationName: string
  changes: SyncChange[]
  fetchedAt: string
}

export interface ConflictItem {
  id: string
  changeId: string
  integrationId: IntegrationId
  fieldName: string
  changeType: SyncChangeType
  localValue: string | null
  externalValue: string | null
  resolution?: ConflictResolutionChoice
  resolvedAt?: string
}

export interface SyncEvent {
  id: string
  integrationId: IntegrationId
  status: HistoryEventStatus
  timestamp: string
  version: string
  summary: string
  changeCount: number
  actor: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'active' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Door {
  id: string
  name: string
  location: string
  device_id: string
  status: 'online' | 'offline'
  battery_level: number
  last_seen: string
  created_at: string
}

export interface Key {
  id: string
  user_id: string
  door_id: string
  key_type: string
  access_start: string
  access_end: string
  status: 'active' | 'revoked'
  created_at: string
}
