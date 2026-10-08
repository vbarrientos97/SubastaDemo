'use client'

import { useEffect, useState } from 'react'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Countdown({
  seconds,
  className,
}: {
  seconds: number
  className?: string
}) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
    const id = setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [seconds])

  return (
    <span className={cn('tabular font-mono', className)} aria-live="polite">
      {formatDuration(remaining)}
    </span>
  )
}
