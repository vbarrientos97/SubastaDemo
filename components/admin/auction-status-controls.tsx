'use client'

import { cn } from '@/lib/utils'
import { auctionStatusActions, auctionStatusLabel, type Auction, type AuctionInput, type AuctionStatus } from '@/lib/domain/auction'
import { auctionStatusBadgeColor } from '@/components/auction/auction-status-style'

export function auctionStatusInput(input: Auction | AuctionInput, status: AuctionStatus): AuctionInput {
  return {
    title: input.title,
    location: input.location,
    seller: input.seller ?? '',
    dates: input.dates,
    startAt: input.startAt ?? '',
    endAt: input.endAt ?? '',
    status,
  }
}

export function AuctionStatusSummary({ auction }: { auction: Auction }) {
  const at = auction.status === 'cerrada'
    ? auction.closedAt ?? auction.endAt
    : auction.status === 'abierta'
      ? auction.endAt
      : auction.startAt
  const message = auction.status === 'publicada'
    ? `Se abre automáticamente el ${formatAuctionDateTime(at)}`
    : auction.status === 'abierta'
      ? `Se cierra automáticamente el ${formatAuctionDateTime(at)}`
      : auction.status === 'cerrada'
        ? `Subasta cerrada el ${formatAuctionDateTime(at)}`
        : null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn('inline-flex min-h-9 items-center rounded-full px-3 text-xs font-bold', auctionStatusBadgeColor(auction.status))}>
        {auctionStatusLabel(auction.status)}
      </span>
      {message ? <p className="text-sm font-medium text-muted-foreground">{message}</p> : null}
    </div>
  )
}

function formatAuctionDateTime(value?: string) {
  if (!value) return 'fecha pendiente'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'fecha pendiente'
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function StatusActionConfirmation({
  auctionTitle,
  startAt,
  error,
  onCancel,
  onConfirm,
}: {
  auctionTitle: string
  startAt?: string
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <section role="alertdialog" aria-label="Confirmar acción de subasta" className="mx-4 my-3 rounded-2xl border border-primary/25 bg-surface-2 p-4 sm:mx-6 lg:mx-8">
      <h2 className="font-semibold text-foreground">¿Publicar la subasta?</h2>
      <p className="mt-1 text-sm text-muted-foreground">“{auctionTitle}” aparecerá en el catálogo y se abrirá automáticamente el {formatAuctionDateTime(startAt)}.</p>
      {error ? <p role="alert" className="mt-2 text-sm font-semibold text-destructive">{error}</p> : null}
      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-accent">Cancelar</button>
        <button type="button" onClick={onConfirm} className="min-h-11 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-foreground hover:bg-accent">
          Publicar
        </button>
      </div>
    </section>
  )
}

export function AuctionStatusActions({
  status,
  onAction,
  compact = false,
}: {
  status: AuctionStatus
  onAction: (status: AuctionStatus) => void
  compact?: boolean
}) {
  const actions = auctionStatusActions(status)
  if (actions.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', compact ? 'justify-start' : 'justify-end')}>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            aria-label={action.label}
            title={action.label}
            onClick={(event) => { event.stopPropagation(); onAction(action.status) }}
            className={cn(
              'inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'border border-border bg-surface text-foreground hover:bg-accent',
              compact && 'px-2 text-xs lg:px-3 lg:text-sm',
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
