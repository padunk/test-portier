interface StatProps {
  label: string
  value: string | number
  hint?: string
}

export function Stat({ label, value, hint }: StatProps) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
      {hint ? <span className="stat__hint">{hint}</span> : null}
    </div>
  )
}
