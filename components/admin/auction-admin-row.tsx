'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Pencil, ArrowRight } from 'lucide-react'
import { DeleteButton } from '@/components/admin/delete-button'
import { AuctionStatusActions } from '@/components/admin/auction-status-controls'
import { auctionStatusLabel, type Auction, type AuctionStatus } from '@/lib/domain/auction'
import { auctionStatusColor } from '@/components/auction/auction-status-style'
import { eyebrow } from '@/lib/styles'

export function AuctionAdminRow({ auction, pendingDelete, onConfirmDelete, onCancelDelete, onRequestDelete, onStatusAction }: {
  auction: Auction
  pendingDelete: boolean
  onConfirmDelete: () => void
  onCancelDelete: () => void
  onRequestDelete: () => void
  onStatusAction: (status: AuctionStatus) => void
}) {
  return (
    <li
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 border-b border-border px-3 py-2 last:border-b-0 lg:px-2 lg:pt-1 lg:pb-4"
    >
      <div className="col-span-2 min-w-0 px-1 py-2 lg:col-span-1 lg:px-2">
        <span className="block truncate text-sm font-semibold text-foreground lg:text-lg">
          {auction.title}
        </span>
        <span className={cn(eyebrow, 'block text-muted-foreground lg:text-sm')}>
          <span className={cn('font-bold', auctionStatusColor(auction.status))}>{auctionStatusLabel(auction.status)}</span> · {auction.clientIds.length} clientes
        </span>
      </div>
      <Link
        href={`/admin/subastas/${auction.id}`}
        aria-label={`Gestionar subasta ${auction.title}`}
        className="col-start-1 row-start-2 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-xl bg-surface-2 px-2.5 text-sm font-semibold text-foreground ring-1 ring-border transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:ml-2 lg:px-3"
      >
        Gestionar
        <ArrowRight className="h-4 w-4 text-primary" />
      </Link>
      <div className="col-start-2 row-start-2 flex shrink-0 items-center justify-end gap-1 lg:row-span-2 lg:row-start-1 lg:gap-3 lg:px-1">
        {pendingDelete ? (
          <>
            <button
              type="button"
              onClick={onConfirmDelete}
              className="min-h-11 px-1 text-sm font-semibold text-primary"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="min-h-11 px-1 text-sm font-semibold text-muted-foreground"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <AuctionStatusActions
              status={auction.status}
              compact
              onAction={onStatusAction}
            />
            <span className="ml-auto flex shrink-0 items-center gap-1">
              <Link
                href={`/admin/subastas/${auction.id}/editar`}
                aria-label="Editar"
                title="Editar"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <DeleteButton onClick={onRequestDelete} className="h-11 w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            </span>
          </>
        )}
      </div>
    </li>
  )
}
