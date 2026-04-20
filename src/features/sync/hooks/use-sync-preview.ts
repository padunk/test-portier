import { useMutation } from '@tanstack/react-query'
import {
  SyncApiError,
  fetchSyncPreview,
} from '../../../shared/api/sync-client'
import type { IntegrationId } from '../../../shared/types/domain'
import { useSyncStore } from '../../../store/sync-store'

export function useSyncPreview(integrationId: IntegrationId) {
  const markSyncRequested = useSyncStore((state) => state.markSyncRequested)
  const setPreview = useSyncStore((state) => state.setPreview)
  const markSyncError = useSyncStore((state) => state.markSyncError)

  return useMutation({
    mutationKey: ['sync-preview', integrationId],
    mutationFn: () => fetchSyncPreview(integrationId),
    onMutate: () => {
      markSyncRequested(integrationId)
    },
    onSuccess: (preview) => {
      setPreview(preview)
    },
    onError: () => {
      markSyncError(integrationId)
    },
  })
}

export function getSyncErrorCopy(error: unknown) {
  if (error instanceof SyncApiError) {
    return {
      title: error.title,
      detail: error.detail,
    }
  }

  return {
    title: 'Unable to load sync preview',
    detail: 'Please retry the request or inspect the integration configuration.',
  }
}
