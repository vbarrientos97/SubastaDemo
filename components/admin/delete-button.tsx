'use client'

import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DeleteButton({
  onClick,
  label = 'Borrar',
  className,
}: {
  onClick: () => void
  label?: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary transition hover:bg-primary/10',
        className,
      )}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
