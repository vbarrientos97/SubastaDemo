'use client'

import type { Lot } from '@/lib/domain/lot'
import { displayedPrice } from '@/lib/domain/lot'
import { clientOfLot, regionOfLot, type Client } from '@/lib/domain/account'
import { regionInk, regionInkClass } from '@/components/admin/region-ink'
import { formatUSD } from '@/lib/format'
import { caption } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function BoardSalesTable({ lots, clients, liveId, onOpen, current, pages, onPageChange }: {
  lots: Lot[]
  clients: Client[]
  liveId: string | null
  onOpen: (lot: Lot) => void
  current: number
  pages: number
  onPageChange: (page: number) => void
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-xs sm:min-w-[56rem] sm:table-auto sm:text-sm">
          <thead>
            <tr className={cn(caption, 'border-y border-border text-muted-foreground')}>
              <th className="w-[14%] pl-3 pr-2 py-2.5 font-semibold sm:w-auto sm:px-4">Lote</th>
              <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Padre</th>
              <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Madre</th>
              <th className="w-[20%] px-2 py-2.5 font-semibold sm:w-auto sm:px-4">Sexo</th>
              <th className="w-[24%] px-2 py-2.5 font-semibold sm:w-auto sm:px-4">Precio</th>
              <th className="px-2 py-2.5 font-semibold sm:px-4">Comprador</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => (
              <SaleRow
                key={lot.id}
                lot={lot}
                clients={clients}
                live={liveId === lot.id}
                onOpen={() => onOpen(lot)}
              />
            ))}
          </tbody>
        </table>
        {lots.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">Ningún lote coincide con la búsqueda.</p>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 sm:justify-end">
        <button
          type="button"
          disabled={current === 0}
          onClick={() => onPageChange(current - 1)}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground disabled:text-muted-foreground"
        >
          Anterior
        </button>
        <span className="text-sm font-semibold tabular text-muted-foreground">
          {current + 1} / {pages}
        </span>
        <button
          type="button"
          disabled={current >= pages - 1}
          onClick={() => onPageChange(current + 1)}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground disabled:text-muted-foreground"
        >
          Siguiente
        </button>
      </div>
    </>
  )
}

function SaleRow({
  lot,
  clients,
  live,
  onOpen,
}: {
  lot: Lot
  clients: Client[]
  live: boolean
  onOpen: () => void
}) {
  const client = clientOfLot(lot, clients)
  const region = regionOfLot(lot, clients)
  const price = displayedPrice(lot)
  return (
    <tr className="border-b border-border transition-colors hover:bg-accent/60 last:border-b-0">
      <td className="pl-3 pr-2 py-3 font-semibold tabular text-foreground sm:px-4">
        <button type="button" onClick={onOpen} aria-label={`Ver información del lote ${lot.order}: ${lot.title}`} className="min-h-11 min-w-11 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <LotNumber lot={lot} live={live} />
        </button>
      </td>
      <td className="hidden max-w-48 truncate px-4 py-3 text-muted-foreground sm:table-cell">
        {lot.sire || '—'}
      </td>
      <td className="hidden max-w-48 truncate px-4 py-3 text-muted-foreground sm:table-cell">
        {lot.dam || '—'}
      </td>
      <td className="px-2 py-3 font-medium text-muted-foreground sm:px-4">
        {lot.category === 'macho' ? 'Macho' : 'Hembra'}
      </td>
      <td className="break-words px-2 py-3 font-semibold tabular text-foreground sm:px-4">
        {price > 0 ? formatUSD(price) : '—'}
      </td>
      <td
        className={cn(
          'break-words px-2 py-3 font-semibold sm:px-4',
          region ? regionInkClass[regionInk[region.id]] : 'text-muted-foreground',
        )}
      >
        {client?.name ?? 'Sin adjudicar'}
      </td>
    </tr>
  )
}

function LotNumber({ lot, live }: { lot: Lot; live: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {live ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
      {lot.order}
    </span>
  )
}
