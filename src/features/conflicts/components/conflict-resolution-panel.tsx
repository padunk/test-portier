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
            Resolve every conflict before merging. Decisions are retained in
            local audit history for this scaffold.
          </p>
        </div>

        <div className="inline-alert" aria-live="polite">
          <AlertTriangle size={16} aria-hidden="true" focusable="false" />
          <span>{unresolvedCount} unresolved</span>
        </div>
      </div>

      <ul className="list-stack" aria-label="Conflict list">
        {conflicts.map((conflict) => {
          const isDelete = conflict.changeType === 'DELETE'
          const localLabel = isDelete ? 'Keep value' : 'Keep local'
          const externalLabel = isDelete ? 'Delete field' : 'Use external'
          const localDisplay = formatValue(conflict.localValue)
          const externalDisplay = isDelete ? 'Delete' : formatValue(conflict.externalValue)

          return (
            <li key={conflict.id} className="list-row list-row--conflict">
              <div className="list-row__title-row">
                <strong>{formatFieldName(conflict.fieldName)}</strong>
                <span className="muted-text">{conflict.changeType}</span>
              </div>

              <div className="decision-grid">
                <div className="decision-column">
                  <label htmlFor={`local-${conflict.id}`}>{localLabel}</label>
                  <button
                    id={`local-${conflict.id}`}
                    aria-label={`${localLabel} for ${formatFieldName(conflict.fieldName)}: ${localDisplay}`}
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
                    aria-label={`${externalLabel} for ${formatFieldName(conflict.fieldName)}: ${externalDisplay}`}
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

              <p className="sr-only" id={`conflict-${conflict.id}`}>
                Conflict for {formatFieldName(conflict.fieldName)}. Choose whether to keep the local or external value.
              </p>
            </li>
          )
        })}
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
