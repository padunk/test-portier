import { create } from 'zustand'
import { deriveConflictsFromPreview } from '../features/conflicts/lib/derive-conflicts'
import { mockSyncHistory } from '../features/history/data/mock-sync-history'
import { mockIntegrations } from '../features/integrations/data/mock-integrations'
import { mockSyncPreviews } from '../features/sync/data/mock-sync-previews'
import { bumpVersion } from '../shared/lib/format'
import type {
  ConflictItem,
  ConflictResolutionChoice,
  Integration,
  IntegrationId,
  SyncEvent,
  SyncPreview,
} from '../shared/types/domain'

type PreviewRecord = Partial<Record<IntegrationId, SyncPreview>>
type ConflictRecord = Partial<Record<IntegrationId, ConflictItem[]>>
type HistoryRecord = Partial<Record<IntegrationId, SyncEvent[]>>

interface SyncWorkspaceState {
  integrations: Integration[]
  previews: PreviewRecord
  conflicts: ConflictRecord
  history: HistoryRecord
  markSyncRequested: (integrationId: IntegrationId) => void
  setPreview: (preview: SyncPreview) => void
  markSyncError: (integrationId: IntegrationId) => void
  chooseResolution: (
    integrationId: IntegrationId,
    conflictId: string,
    resolution: ConflictResolutionChoice,
  ) => void
  applyResolutions: (integrationId: IntegrationId) => void
}

function buildPreviewRecord() {
  return mockSyncPreviews.reduce<PreviewRecord>((record, preview) => {
    record[preview.integrationId] = preview
    return record
  }, {})
}

function buildConflictRecord() {
  return mockSyncPreviews.reduce<ConflictRecord>((record, preview) => {
    record[preview.integrationId] = deriveConflictsFromPreview(preview)
    return record
  }, {})
}

function buildHistoryRecord() {
  return mockSyncHistory.reduce<HistoryRecord>((record, event) => {
    record[event.integrationId] = [...(record[event.integrationId] ?? []), event]
    return record
  }, {})
}

function updateIntegration(
  integrations: Integration[],
  integrationId: IntegrationId,
  updater: (integration: Integration) => Integration,
) {
  return integrations.map((integration) => {
    if (integration.id !== integrationId) {
      return integration
    }

    return updater(integration)
  })
}

export const useSyncStore = create<SyncWorkspaceState>((set) => ({
  integrations: mockIntegrations,
  previews: buildPreviewRecord(),
  conflicts: buildConflictRecord(),
  history: buildHistoryRecord(),
  markSyncRequested: (integrationId) =>
    set((state) => ({
      integrations: updateIntegration(state.integrations, integrationId, (integration) => ({
        ...integration,
        status: 'syncing',
      })),
    })),
  setPreview: (preview) =>
    set((state) => {
      const conflicts = deriveConflictsFromPreview(preview)

      return {
        previews: {
          ...state.previews,
          [preview.integrationId]: preview,
        },
        conflicts: {
          ...state.conflicts,
          [preview.integrationId]: conflicts,
        },
        integrations: updateIntegration(
          state.integrations,
          preview.integrationId,
          (integration) => ({
            ...integration,
            status: conflicts.length > 0 ? 'conflict' : 'synced',
            lastSyncAt: preview.fetchedAt,
            pendingConflicts: conflicts.length,
          }),
        ),
      }
    }),
  markSyncError: (integrationId) =>
    set((state) => ({
      integrations: updateIntegration(state.integrations, integrationId, (integration) => ({
        ...integration,
        status: 'error',
      })),
    })),
  chooseResolution: (integrationId, conflictId, resolution) =>
    set((state) => ({
      conflicts: {
        ...state.conflicts,
        [integrationId]: (state.conflicts[integrationId] ?? []).map((conflict) =>
          conflict.id === conflictId ? { ...conflict, resolution } : conflict,
        ),
      },
    })),
  applyResolutions: (integrationId) =>
    set((state) => {
      const preview = state.previews[integrationId]
      const existingConflicts = state.conflicts[integrationId] ?? []

      if (!preview || existingConflicts.some((conflict) => !conflict.resolution)) {
        return state
      }

      const appliedAt = new Date().toISOString()
      const integrations = updateIntegration(
        state.integrations,
        integrationId,
        (integration) => ({
          ...integration,
          status: 'synced',
          pendingConflicts: 0,
          lastSyncAt: appliedAt,
          version: bumpVersion(integration.version),
        }),
      )
      const nextVersion =
        integrations.find((integration) => integration.id === integrationId)?.version ?? 'v1.0.0'

      return {
        integrations,
        conflicts: {
          ...state.conflicts,
          [integrationId]: existingConflicts.map((conflict) => ({
            ...conflict,
            resolvedAt: appliedAt,
          })),
        },
        history: {
          ...state.history,
          [integrationId]: [
            {
              id: `evt_${integrationId}_${appliedAt}`,
              integrationId,
              status: 'success',
              timestamp: appliedAt,
              version: nextVersion,
              summary: `Applied ${preview.changes.length} staged changes after resolving ${existingConflicts.length} field conflicts.`,
              changeCount: preview.changes.length,
              actor: 'Manual reviewer',
            },
            ...(state.history[integrationId] ?? []),
          ],
        },
      }
    }),
}))
