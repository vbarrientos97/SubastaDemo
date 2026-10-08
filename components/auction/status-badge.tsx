import { Flame, Lock, Radio, CalendarClock } from 'lucide-react'
import type { LotStatus } from '@/lib/domain/lot'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

const config: Record<
  LotStatus,
  { label: string; className: string; icon: React.ElementType; dot?: boolean }
> = {
  extended: {
    label: 'Tiempo extendido',
    className: 'bg-primary text-primary-foreground',
    icon: Flame,
  },
  live: {
    label: 'En vivo · Abierto',
    className: 'bg-black/55 text-emerald-300 ring-1 ring-emerald-300/40 backdrop-blur-sm',
    icon: Radio,
    dot: true,
  },
  imminent: {
    label: 'Cierre inminente',
    className: 'bg-primary text-primary-foreground',
    icon: Flame,
  },
  closed: {
    label: 'Lote cerrado',
    className: 'bg-black/55 text-white/80 ring-1 ring-white/15 backdrop-blur-sm',
    icon: Lock,
  },
  upcoming: {
    label: 'Próximamente',
    className: 'bg-black/55 text-amber-300 ring-1 ring-amber-300/40 backdrop-blur-sm',
    icon: CalendarClock,
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: LotStatus
  className?: string
}) {
  const { label, className: variant, icon: Icon, dot } = config[status]
  return (
    <span
      className={cn(
        eyebrow,
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        variant,
        className,
      )}
    >
      {dot ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  )
}
