'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useModalFocus } from '@/hooks/use-modal-focus'
import { clientOfLot, type Client } from '@/lib/domain/account'
import { categoryLabel, displayedPrice, statusLabel, type Lot } from '@/lib/domain/lot'
import { formatKg, formatUSD } from '@/lib/format'
import { eyebrow, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function LotInfoModal({ lot, clients, onClose }: { lot: Lot; clients: Client[]; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null)
  useModalFocus(dialogRef, true, onClose)
  const client = clientOfLot(lot, clients)
  const photos = lot.images?.filter(Boolean) ?? []
  const image = photos[0] || lot.image || '/placeholder.svg'
  const amount = displayedPrice(lot)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lot-dialog-title"
        className={cn(panel, 'relative flex max-h-[min(92dvh,56rem)] w-full max-w-3xl flex-col overflow-hidden shadow-2xl')}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className={cn(eyebrow, 'text-primary')}>{statusLabel(lot.status)} · {categoryLabel(lot.category)}</p>
            <h2 id="lot-dialog-title" className="mt-1 break-words font-display text-lg font-bold leading-tight text-foreground sm:text-2xl">
              Lote {String(lot.order).padStart(2, '0')} · {lot.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar información del lote"
            title="Cerrar"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto">
          <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.9fr)]">
            <div className="relative aspect-[4/3] bg-surface-2 sm:aspect-auto sm:min-h-72">
              <Image src={image} alt={lot.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <div>
                <p className={cn(eyebrow, 'text-muted-foreground')}>Raza</p>
                <p className="mt-1 font-display text-lg font-bold text-foreground">{lot.breed}</p>
                <p className="mt-1 text-sm text-muted-foreground">{lot.headCount} {lot.headCount === 1 ? 'cabeza' : 'cabezas'}</p>
                {lot.color || lot.seller ? (
                  <p className="mt-2 text-sm text-muted-foreground">Color: {lot.color ?? '—'}{lot.seller ? ` · ${lot.seller}` : ''}</p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-success/10 p-4">
                <p className={cn(eyebrow, 'text-muted-foreground')}>{lot.status === 'closed' ? 'Precio final' : 'Puja actual'}</p>
                <p className="mt-1 font-display text-2xl font-bold tabular text-success sm:text-3xl">${formatUSD(amount, { decimals: true })}</p>
                {client ? <p className="mt-1 text-sm font-semibold text-foreground">{lot.status === 'closed' ? 'Ganado por' : 'Lidera'}: {client.name}</p> : null}
              </div>

              {lot.sire || lot.dam ? (
                <dl className="grid grid-cols-2 gap-3">
                  {lot.sire ? <InfoField label="Padre" value={lot.sire} /> : null}
                  {lot.dam ? <InfoField label="Madre" value={lot.dam} /> : null}
                </dl>
              ) : null}

              <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                <InfoField label="Peso" value={`${formatKg(lot.weightKg)} kg`} />
                <InfoField label="Precio por kg" value={`$${formatUSD(lot.pricePerKg, { decimals: true })}`} />
                {lot.opensAtLabel ? <InfoField label="Abre" value={lot.opensAtLabel} /> : null}
                {lot.closesAtLabel ? <InfoField label="Cierra" value={lot.closesAtLabel} /> : null}
              </dl>
            </div>
          </div>

          {lot.bids?.length ? (
            <section className="border-t border-border p-5 sm:p-6">
              <h3 className="font-display text-base font-bold text-foreground">Pujas recientes</h3>
              <ul className="mt-3 divide-y divide-border rounded-2xl border border-border">
                {lot.bids.slice(0, 5).map((bid, index) => (
                  <li key={`${bid.bidder}-${bid.time}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{bid.bidder}</span>
                      <span className="text-xs text-muted-foreground">{bid.date} · {bid.time}</span>
                    </span>
                    <span className="shrink-0 font-bold tabular text-success">${formatUSD(bid.amount, { decimals: true })}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className={cn(eyebrow, 'text-muted-foreground')}>{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-foreground">{value}</dd>
    </div>
  )
}
