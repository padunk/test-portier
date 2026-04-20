import clsx from 'clsx'
import type { ReactNode } from 'react'

interface BadgeProps {
  tone:
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline'
  children: ReactNode
  ariaLabel?: string
}

export function Badge({ tone, children, ariaLabel }: BadgeProps) {
  return (
    <span aria-label={ariaLabel} className={clsx('badge', `badge--${tone}`)}>
      {children}
    </span>
  )
}
