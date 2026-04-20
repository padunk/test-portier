import { create } from 'zustand'
import { deriveConflictsFromPreview } from '../features/conflicts/lib/derive-conflicts'
import { mockSyncHistory } from '../features/history/data/mock-sync-history'
import { mockIntegrations } from '../features/integrations/data/mock-integrations'
import { bumpVersion } from '../shared/lib/format'
import type {
  ConflictItem,
  Integration,
  IntegrationId,
  SyncEvent,
  SyncEventChange,
  SyncPreview,
  ConflictResolutionChoice,
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
  markSyncError: (integrationId: IntegrationId, errorTitle: string) => void
  chooseResolution: (
    integrationId: IntegrationId,
    conflictId: string,
    resolution: ConflictResolutionChoice,
  ) => void
  applyResolutions: (integrationId: IntegrationId) => void
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

function previewToHistoryChanges(preview: SyncPreview): SyncEventChange[] {
  return preview.changes.map((change) => ({
    fieldName: change.fieldName,
    changeType: change.changeType,
    fromValue: change.currentValue,
    toValue: change.newValue,
  }))
}

function buildMergedPreview(
  preview: SyncPreview,
  conflicts: ConflictItem[],
  appliedAt: string,
): { preview: SyncPreview; appliedChanges: SyncEventChange[] } {
  const resolutionByChangeId = new Map<string, ConflictResolutionChoice>()
  for (const conflict of conflicts) {
    if (conflict.resolution) {
      resolutionByChangeId.set(conflict.changeId, conflict.resolution)
    }
  }

  const appliedChanges: SyncEventChange[] = []
  const remainingChanges = preview.changes.flatMap((change) => {
    const resolution = resolutionByChangeId.get(change.id)

    // Non-conflict changes (ADD) always apply.
    if (!resolution) {
      appliedChanges.push({
        fieldName: change.fieldName,
        changeType: change.changeType,
        fromValue: change.currentValue,
        toValue: change.newValue,
      })
      return []
    }

    if (resolution === 'external') {
      appliedChanges.push({
        fieldName: change.fieldName,
        changeType: change.changeType,
        fromValue: change.currentValue,
        toValue: change.newValue,
        resolution,
      })
      return []
    }

    // Kept local: record the decision but do not apply the incoming change.
    appliedChanges.push({
      fieldName: change.fieldName,
      changeType: change.changeType,
      fromValue: change.currentValue,
      toValue: change.currentValue,
      resolution,
    })
    return []
  })

  return {
    preview: {
      ...preview,
      fetchedAt: appliedAt,
      changes: remainingChanges,
    },
    appliedChanges,
  }
}

function summariseApply(applied: SyncEventChange[]) {
  const acceptedExternal = applied.filter((change) => change.resolution === 'external').length
  const keptLocal = applied.filter((change) => change.resolution === 'local').length
  const autoApplied = applied.filter((change) => !change.resolution).length

  const parts: string[] = []
  if (autoApplied > 0) parts.push(`${autoApplied} auto-applied`)
  if (acceptedExternal > 0) parts.push(`${acceptedExternal} resolved to external`)
  if (keptLocal > 0) parts.push(`${keptLocal} kept local`)

  return parts.length > 0
    ? `Merged sync run: ${parts.join(', ')}.`
    : 'Merged sync run with no field changes.'
}

export const useSyncStore = create<SyncWorkspaceState>((set) => ({
  integrations: mockIntegrations,
  previews: {},
  conflicts: {},
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
      const integration = state.integrations.find(
        (item) => item.id === preview.integrationId,
      )
      const baseVersion = integration?.version ?? 'v1.0.0'
      const nextVersion = conflicts.length > 0 ? baseVersion : bumpVersion(baseVersion)

      const event: SyncEvent = {
        id: `evt_${preview.integrationId}_${preview.fetchedAt}`,
        integrationId: preview.integrationId,
        status: conflicts.length > 0 ? 'warning' : 'success',
        timestamp: preview.fetchedAt,
        version: nextVersion,
        summary:
          conflicts.length > 0
            ? `Fetched preview with ${conflicts.length} field conflict${conflicts.length === 1 ? '' : 's'} pending review.`
            : `Fetched and applied ${preview.changes.length} change${preview.changes.length === 1 ? '' : 's'} with no conflicts.`,
        changeCount: preview.changes.length,
        actor: 'Sync engine',
        changes: previewToHistoryChanges(preview),
      }

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
          (current) => ({
            ...current,
            status: conflicts.length > 0 ? 'conflict' : 'synced',
            lastSyncAt: preview.fetchedAt,
            pendingConflicts: conflicts.length,
            version: nextVersion,
          }),
        ),
        history: {
          ...state.history,
          [preview.integrationId]: [event, ...(state.history[preview.integrationId] ?? [])],
        },
      }
    }),
  markSyncError: (integrationId, errorTitle) =>
    set((state) => {
      const integration = state.integrations.find((item) => item.id === integrationId)
      const errorEvent: SyncEvent = {
        id: `evt_${integrationId}_error_${new Date().toISOString()}`,
        integrationId,
        status: 'error',
        timestamp: new Date().toISOString(),
        version: integration?.version ?? 'v1.0.0',
        summary: errorTitle,
        changeCount: 0,
        actor: 'Sync engine',
      }

      return {
        integrations: updateIntegration(state.integrations, integrationId, (current) => ({
          ...current,
          status: 'error',
        })),
        history: {
          ...state.history,
          [integrationId]: [errorEvent, ...(state.history[integrationId] ?? [])],
        },
      }
    }),
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

      if (!preview || existingConflicts.length === 0) {
        return state
      }
      if (existingConflicts.some((conflict) => !conflict.resolution)) {
        return state
      }

      const appliedAt = new Date().toISOString()
      const { preview: mergedPreview, appliedChanges } = buildMergedPreview(
        preview,
        existingConflicts,
        appliedAt,
      )

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

      const event: SyncEvent = {
        id: `evt_${integrationId}_merge_${appliedAt}`,
        integrationId,
        status: 'success',
        timestamp: appliedAt,
        version: nextVersion,
        summary: summariseApply(appliedChanges),
        changeCount: appliedChanges.length,
        actor: 'Manual reviewer',
        changes: appliedChanges,
      }

      return {
        integrations,
        previews: {
          ...state.previews,
          [integrationId]: mergedPreview,
        },
        conflicts: {
          ...state.conflicts,
          [integrationId]: [],
        },
        history: {
          ...state.history,
          [integrationId]: [event, ...(state.history[integrationId] ?? [])],
        },
      }
    }),
}))
