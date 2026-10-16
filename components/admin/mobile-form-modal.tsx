'use client'

import { useRef, type ReactNode } from 'react'
import { useModalFocus } from '@/hooks/use-modal-focus'
import { cn } from '@/lib/utils'

export function MobileFormModal({
  labelledBy,
  onClose,
  className,
  children,
}: {
  labelledBy: string
  onClose: () => void
  className?: string
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const modal = useModalFocus(dialogRef, true, onClose, '(max-width: 1023px)')

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-6 lg:static lg:block lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role={modal ? 'dialog' : 'group'}
        aria-modal={modal || undefined}
        aria-labelledby={labelledBy}
        className={cn(
          'max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-surface shadow-2xl sm:max-h-[calc(100dvh-3rem)] lg:mx-auto lg:max-h-none lg:max-w-none lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
