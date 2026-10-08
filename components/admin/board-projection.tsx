'use client'

import { useEffect, useState, type Ref } from 'react'
import { Maximize2, X } from 'lucide-react'
import { clientOfLot, regionOfLot, type Client } from '@/lib/domain/account'
import { displayedPrice, type Lot } from '@/lib/domain/lot'
import { regions } from '@/lib/domain/region'
import { formatUSD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { regionBoardInkClass, regionSwatchClass } from '@/components/admin/region-ink'

const projectedColumns =
  'grid grid-cols-[4.25rem_5.75rem_minmax(13.5rem,1fr)] items-center gap-x-3 px-4'
const minProjectedColumn = 448

export function BoardProjection({
  boardRef,
  title,
  dates,
  lots,
  clients,
  liveId,
  prizes,
  fullscreen,
  onFill,
  onClose,
}: {
  boardRef: Ref<HTMLDivElement>
  title: string
  dates: string
  lots: Lot[]
  clients: Client[]
  liveId: string | null
  prizes: { macho: Lot | null; hembra: Lot | null }
  fullscreen: boolean
  onFill: () => void
  onClose: () => void
}) {
  const rows = useProjectionRows(lots.length)
  const columns = chunkLots(lots, rows)

  return (
    <div
      ref={boardRef}
      role="dialog"
      aria-modal="true"
      aria-label="Pizarra del remate"
      className="fixed inset-0 z-50 flex h-full w-full flex-col bg-neutral-50 text-neutral-950"
    >
      <header className="flex items-start justify-between gap-6 px-6 pt-4 pb-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {title}
          </h2>
          {dates ? <p className="mt-1 text-sm text-neutral-500">{dates}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {fullscreen ? null : (
            <button
              type="button"
              onClick={onFill}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-200/80"
            >
              <Maximize2 className="h-4 w-4" />
              Pantalla completa
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-200/80"
          >
            <X className="h-4 w-4" />
            Cerrar
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-neutral-200 bg-white px-6 py-2.5">
        <ProjectedPrize title="Premio macho" lot={prizes.macho} clients={clients} />
        <ProjectedPrize title="Premio hembra" lot={prizes.hembra} clients={clients} />
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:ml-auto">
          {regions.map((region) => (
            <li key={region.id} className="flex items-center gap-1.5 text-xs font-bold uppercase">
              <span
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-sm',
                  region.ink === 'black' ? 'bg-neutral-950' : regionSwatchClass[region.ink],
                )}
              />
              <span className={regionBoardInkClass[region.ink]}>{region.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-h-0 flex-1 overflow-x-auto">
        {columns.map((column, index) => (
          <section
            key={column[0]?.id ?? index}
            className={cn(
              'flex min-w-[28rem] flex-1 flex-col',
              index > 0 && 'border-l border-neutral-200',
            )}
          >
            <div
              className={cn(
                projectedColumns,
                'shrink-0 border-b border-neutral-200 bg-neutral-100/80 py-2 text-[11px] font-bold uppercase tracking-wide text-neutral-500',
              )}
            >
              <span>Lote</span>
              <span>Precio</span>
              <span>Comprador</span>
            </div>
            <ol className="flex min-h-0 flex-1 flex-col">
              {column.map((lot) => (
                <li
                  key={lot.id}
                  style={{ height: `${100 / rows}%` }}
                  className={cn(
                    'min-h-0 border-b border-neutral-200/80',
                    liveId === lot.id && 'bg-red-50',
                  )}
                >
                  <ProjectedLot lot={lot} clients={clients} />
                </li>
              ))}
            </ol>
          </section>
        ))}
        {lots.length === 0 ? (
          <p className="px-6 py-8 text-lg text-neutral-500">Ningún lote coincide con la búsqueda.</p>
        ) : null}
      </div>
    </div>
  )
}

function ProjectedLot({ lot, clients }: { lot: Lot; clients: Client[] }) {
  const client = clientOfLot(lot, clients)
  const region = regionOfLot(lot, clients)
  const price = displayedPrice(lot)
  return (
    <div className={cn(projectedColumns, 'h-full')}>
      <span className="text-[clamp(1rem,2.2vh,1.75rem)] font-bold tabular text-neutral-950">
        <LotMark lot={lot} />
      </span>
      <span className="text-[clamp(1rem,2.2vh,1.75rem)] font-semibold tabular text-neutral-950">
        {price > 0 ? formatUSD(price) : ''}
      </span>
      <span
        className={cn(
          'whitespace-nowrap text-[clamp(1rem,2.2vh,1.65rem)] font-semibold',
          region ? regionBoardInkClass[region.ink] : 'text-neutral-400',
        )}
      >
        {client?.name ?? ''}
      </span>
    </div>
  )
}

function ProjectedPrize({
  title,
  lot,
  clients,
}: {
  title: string
  lot: Lot | null
  clients: Client[]
}) {
  const client = lot ? clientOfLot(lot, clients) : null
  return (
    <p className="flex items-baseline gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{title}</span>
      <span className="text-lg font-bold tabular text-neutral-950">
        {lot ? formatUSD(displayedPrice(lot)) : '—'}
      </span>
      {client ? <span className="text-sm font-semibold text-neutral-600">{client.name}</span> : null}
    </p>
  )
}

export function LotMark({ lot }: { lot: Lot }) {
  return (
    <>
      {lot.order}
      {lot.category === 'hembra' ? <span className="text-[0.72em]">H</span> : null}
    </>
  )
}

function chunkLots(lots: Lot[], rows: number) {
  const size = Math.max(1, rows)
  const columns: Lot[][] = []
  for (let index = 0; index < lots.length; index += size) {
    columns.push(lots.slice(index, index + size))
  }
  return columns
}

function useProjectionRows(lotCount: number) {
  const [rows, setRows] = useState(12)

  useEffect(() => {
    function measure() {
      const chrome = 168
      const minRow = 44
      const availableH = Math.max(minRow, window.innerHeight - chrome)
      const maxColumns = Math.max(1, Math.floor(window.innerWidth / minProjectedColumn))
      const rowsByHeight = Math.max(1, Math.floor(availableH / minRow))
      const columnsNeeded = Math.max(1, Math.ceil(Math.max(lotCount, 1) / rowsByHeight))
      const columns = Math.min(maxColumns, columnsNeeded)
      setRows(Math.max(1, Math.ceil(Math.max(lotCount, 1) / columns)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [lotCount])

  return rows
}
