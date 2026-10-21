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
  const [clock, setClock] = useState({ seconds, remaining: seconds })
  if (clock.seconds !== seconds) setClock({ seconds, remaining: seconds })

  useEffect(() => {
    const id = setInterval(() => {
      setClock((current) => ({ ...current, remaining: Math.max(0, current.remaining - 1) }))
    }, 1000)
    return () => clearInterval(id)
  }, [seconds])

  return (
    <span className={cn('tabular font-mono', className)}>
      {formatDuration(clock.remaining)}
    </span>
  )
}
