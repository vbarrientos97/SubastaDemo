import type { AuctionStatus } from '@/lib/domain/auction'

export function auctionStatusColor(status: AuctionStatus) {
  if (status === 'abierta') return 'text-success dark:text-emerald-400'
  if (status === 'cerrada') return 'text-closed dark:text-red-400'
  if (status === 'publicada') return 'text-warning dark:text-orange-400'
  return 'text-muted-foreground'
}

export function auctionStatusBadgeColor(status: AuctionStatus) {
  if (status === 'abierta') return 'bg-success-soft text-success dark:bg-emerald-950/50 dark:text-emerald-300'
  if (status === 'cerrada') return 'bg-closed-soft text-closed dark:bg-red-950/50 dark:text-red-300'
  if (status === 'publicada') return 'bg-warning-soft text-warning dark:bg-orange-950/50 dark:text-orange-300'
  return 'bg-surface-2 text-muted-foreground'
}

