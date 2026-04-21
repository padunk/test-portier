export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatRelativeTime(value: string) {
  const now = Date.now()
  const diffMs = new Date(value).getTime() - now
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  if (Math.abs(diffHours) < 24) {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      diffHours,
      'hour',
    )
  }

  const diffDays = Math.round(diffHours / 24)

  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    diffDays,
    'day',
  )
}

export function formatFieldName(fieldName: string) {
  const [entity, field] = fieldName.split('.')

  if (!entity || !field) {
    return fieldName
  }

  return `${capitalize(entity)} • ${field.replaceAll('_', ' ')}`
}

export function extractEntityContext(changes: { fieldName: string, currentValue?: string | null, newValue?: string | null }[], fieldName: string) {
  const entityType = fieldName.split('.')[0]
  if (!entityType) return 'Unknown Entity'
  
  const idChange = changes.find(c => c.fieldName === `${entityType}.id`)
  const id = idChange?.newValue || idChange?.currentValue
  
  return id ? `${capitalize(entityType)} (${id})` : capitalize(entityType)
}

export function formatValue(value: string | null) {
  return value ?? '—'
}

export function bumpVersion(version: string) {
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)$/)

  if (!match) {
    return 'v1.0.0'
  }

  const [, major, minor, patch] = match

  return `v${major}.${minor}.${Number(patch) + 1}`
}

export function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
