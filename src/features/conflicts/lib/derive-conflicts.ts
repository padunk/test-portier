import type { ConflictItem, SyncPreview } from '../../../shared/types/domain'
import { extractEntityContext } from '../../../shared/lib/format'

export function deriveConflictsFromPreview(preview: SyncPreview): ConflictItem[] {
  return preview.changes
    .filter((change) => change.changeType === 'UPDATE' || change.changeType === 'DELETE')
    .map((change) => ({
      id: `${preview.integrationId}-${change.id}`,
      changeId: change.id,
      integrationId: preview.integrationId,
      fieldName: change.fieldName,
      changeType: change.changeType,
      localValue: change.currentValue,
      externalValue: change.newValue,
      entityContext: extractEntityContext(preview.changes, change.fieldName),
    }))
}
