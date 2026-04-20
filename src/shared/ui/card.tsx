import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx('card', className)} {...props}>
      {children}
    </div>
  )
}
