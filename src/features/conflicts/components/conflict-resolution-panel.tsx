import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { formatFieldName, formatValue } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/card'
import { EmptyState } from '../../../shared/ui/empty-state'
import type {
  ConflictItem,
  ConflictResolutionChoice,
} from '../../../shared/types/domain'

interface ConflictResolutionPanelProps {
  conflicts: ConflictItem[]
  onChooseResolution: (
    conflictId: string,
    resolution: ConflictResolutionChoice,
    mergedValue?: string | null,
  ) => void
  onApply: () => void
}

export function ConflictResolutionPanel({
  conflicts,
  onChooseResolution,
  onApply,
}: ConflictResolutionPanelProps) {
  if (conflicts.length === 0) {
    return (
      <EmptyState
        title="No field conflicts detected"
        description="When a local and external value disagree, a side-by-side review will appear here."
      />
    )
  }

  const unresolvedCount = conflicts.filter(
    (conflict) => !conflict.resolution,
  ).length

  return (
    <Card aria-labelledby="conflict-resolution-title">
      <div className="panel-header">
        <div>
          <p className="panel-header__eyebrow">Conflict resolution</p>
          <h2 id="conflict-resolution-title">Choose a winning value per field</h2>
          <p>
            Resolve every conflict before merging. Pick the local value, the
            incoming external value, or compose a manual merge.
          </p>
        </div>

        <div className="inline-alert" aria-live="polite">
          <AlertTriangle size={16} aria-hidden="true" focusable="false" />
          <span>{unresolvedCount} unresolved</span>
        </div>
      </div>

      <ul className="list-stack" aria-label="Conflict list">
        {conflicts.map((conflict) => (
          <ConflictRow
            key={conflict.id}
            conflict={conflict}
            onChooseResolution={onChooseResolution}
          />
        ))}
      </ul>

      <div className="panel-footer">
        <p className="muted-text">
          Apply merge only after every field has a selected winner.
        </p>
        <button
          className="button button--primary"
          type="button"
          disabled={unresolvedCount > 0}
          aria-disabled={unresolvedCount > 0}
          onClick={onApply}
        >
          Apply merge decisions
        </button>
      </div>
    </Card>
  )
}

interface ConflictRowProps {
  conflict: ConflictItem
  onChooseResolution: ConflictResolutionPanelProps['onChooseResolution']
}

function ConflictRow({ conflict, onChooseResolution }: ConflictRowProps) {
  const isDelete = conflict.changeType === 'DELETE'
  const localLabel = isDelete ? 'Keep value' : 'Keep local'
  const externalLabel = isDelete ? 'Delete field' : 'Use external'
  const localDisplay = formatValue(conflict.localValue)
  const externalDisplay = isDelete ? 'Delete' : formatValue(conflict.externalValue)

  const fieldLabel = formatFieldName(conflict.fieldName)
  const mergeInputId = `merge-${conflict.id}`

  const [mergeDraft, setMergeDraft] = useState<string>(
    conflict.mergedValue ?? conflict.externalValue ?? conflict.localValue ?? '',
  )

  const commitMerge = (value: string) => {
    onChooseResolution(conflict.id, 'merge', value)
  }

  return (
    <li className="list-row list-row--conflict">
      <div className="list-row__title-row">
        <div>
          <strong>{fieldLabel}</strong>
          {conflict.entityContext ? (
            <span className="entity-context">{conflict.entityContext}</span>
          ) : null}
        </div>
        <span className="muted-text">{conflict.changeType}</span>
      </div>

      <div className="decision-grid">
        <div className="decision-column">
          <label htmlFor={`local-${conflict.id}`}>{localLabel}</label>
          <button
            id={`local-${conflict.id}`}
            aria-label={`${localLabel} for ${fieldLabel}: ${localDisplay}`}
            aria-pressed={conflict.resolution === 'local'}
            aria-describedby={`conflict-${conflict.id}`}
            className={
              conflict.resolution === 'local'
                ? 'decision-card decision-card--selected'
                : 'decision-card'
            }
            type="button"
            onClick={() => onChooseResolution(conflict.id, 'local')}
          >
            <strong>{localDisplay}</strong>
          </button>
        </div>

        <div className="decision-column">
          <label htmlFor={`external-${conflict.id}`}>{externalLabel}</label>
          <button
            id={`external-${conflict.id}`}
            aria-label={`${externalLabel} for ${fieldLabel}: ${externalDisplay}`}
            aria-pressed={conflict.resolution === 'external'}
            aria-describedby={`conflict-${conflict.id}`}
            className={
              conflict.resolution === 'external'
                ? 'decision-card decision-card--selected'
                : 'decision-card'
            }
            type="button"
            onClick={() => onChooseResolution(conflict.id, 'external')}
          >
            <strong>{externalDisplay}</strong>
          </button>
        </div>
      </div>

      {!isDelete ? (
        <div className="decision-merge">
          <label htmlFor={mergeInputId}>Manual merge</label>
          <div className="decision-merge__row">
            <input
              id={mergeInputId}
              type="text"
              value={mergeDraft}
              onChange={(event) => setMergeDraft(event.target.value)}
              onBlur={() => {
                if (conflict.resolution === 'merge') commitMerge(mergeDraft)
              }}
              placeholder="Compose a merged value"
              aria-describedby={`conflict-${conflict.id}`}
              className={
                conflict.resolution === 'merge'
                  ? 'decision-merge__input decision-merge__input--selected'
                  : 'decision-merge__input'
              }
            />
            <button
              type="button"
              aria-pressed={conflict.resolution === 'merge'}
              className={
                conflict.resolution === 'merge'
                  ? 'button button--primary'
                  : 'button button--ghost'
              }
              onClick={() => commitMerge(mergeDraft)}
              disabled={mergeDraft.trim().length === 0}
            >
              {conflict.resolution === 'merge' ? 'Merge selected' : 'Use merged value'}
            </button>
          </div>
        </div>
      ) : null}

      <p className="sr-only" id={`conflict-${conflict.id}`}>
        Conflict for {fieldLabel}. Choose whether to keep the local value, accept
        the external value, or commit a manually merged value.
      </p>
    </li>
  )
}
