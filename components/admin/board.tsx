'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal, flushSync } from 'react-dom'
import Image from 'next/image'
import { Maximize2, Search, X } from 'lucide-react'
import { BoardProjection } from '@/components/admin/board-projection'
import { clientOfLot, regionOfLot, type Client } from '@/lib/domain/account'
import {
  boardLots,
  floorLot,
  prizeLots,
  remateProgress,
  salesTotal,
  type BoardQuery,
} from '@/lib/domain/board'
import { auctionStatusColor, auctionStatusLabel } from '@/lib/domain/auction'
import { categoryLabel, displayedPrice, statusLabel, type Lot } from '@/lib/domain/lot'
import { regions, type RegionInk } from '@/lib/domain/region'
import { formatKg, formatUSD } from '@/lib/format'
import { caption, eyebrow, field, panel, panelSm } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { useSession } from '@/components/auth/session-provider'
import { regionChipClass, regionInkClass } from '@/components/admin/region-ink'

const pageSize = 6

export function Board({ auctionId }: { auctionId: string }) {
  const { state } = useSession()
  const [text, setText] = useState('')
  const [regionId, setRegionId] = useState<BoardQuery['regionId']>('todos')
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!expanded) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !document.fullscreenElement) setExpanded(false)
    }

    function onFullscreen() {
      setFullscreen(document.fullscreenElement === boardRef.current)
      if (!document.fullscreenElement) setExpanded(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFullscreen)
    }
  }, [expanded])

  if (!state) return null

  const auction = state.auctions.find((item) => item.id === auctionId) ?? null
  const lots = auction ? state.lots.filter((lot) => lot.auctionId === auction.id) : []
  const { clients } = state
  if (!auction) {
    return <p className="text-sm text-muted-foreground">Esa subasta ya no está.</p>
  }
  const prizes = prizeLots(lots)
  const progress = remateProgress(lots)
  const active = floorLot(lots)
  const filtered = boardLots(lots, clients, { text, regionId })
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize)
  const from = filtered.length === 0 ? 0 : current * pageSize + 1
  const to = Math.min(filtered.length, (current + 1) * pageSize)

  function pickRegion(next: BoardQuery['regionId']) {
    setRegionId(next)
    setPage(0)
  }

  function openBoard() {
    flushSync(() => setExpanded(true))
    const node = boardRef.current
    if (node && document.fullscreenElement !== node) {
      void node.requestFullscreen?.().catch(() => {})
    }
  }

  function closeBoard() {
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => setExpanded(false))
      return
    }
    setExpanded(false)
  }

  function fillScreen() {
    const node = boardRef.current
    if (!node || document.fullscreenElement === node) return
    void node.requestFullscreen?.().catch(() => {})
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={cn(eyebrow, 'flex items-center gap-2', auctionStatusColor(auction.status))}>
            {active ? (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            ) : null}
            {auctionStatusLabel(auction.status)}
            {active ? ' · En vivo' : ''}
          </p>
          <h1 className="mt-1 break-words font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
            {auction.title || 'Sin subasta'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[auction.seller, auction.location, auction.dates].filter(Boolean).join(' · ')}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total vendido" value={`$${formatUSD(salesTotal(lots))}`} hint="Ventas cerradas" />
        <Stat
          label="Lotes rematados"
          value={`${progress.closed} / ${progress.total}`}
          hint={`${progress.percent}% del remate`}
        />
        <PrizeStat title="Premio macho" lot={prizes.macho} clients={clients} />
        <PrizeStat title="Premio hembra" lot={prizes.hembra} clients={clients} />
      </section>

      {lots.length === 0 ? (
        <p className="text-sm text-muted-foreground">Esta subasta todavía no tiene lotes.</p>
      ) : (
      <section className={cn(panel, 'overflow-hidden')}>
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">Pizarra del remate</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {from}–{to} de {filtered.length}
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <label className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={text}
                onChange={(event) => {
                  setText(event.target.value)
                  setPage(0)
                }}
                placeholder="Lote o comprador"
                aria-label="Buscar lote o comprador"
                className={cn(field, 'pl-9')}
              />
            </label>
            <button
              type="button"
              onClick={openBoard}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/25 hover:bg-foreground hover:text-background"
            >
              <Maximize2 className="h-4 w-4" />
              Ampliar
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          <FilterChip active={regionId === 'todos'} onClick={() => pickRegion('todos')}>
            Todos
          </FilterChip>
          {regions.map((region) => (
            <FilterChip
              key={region.id}
              active={regionId === region.id}
              ink={region.ink}
              onClick={() => pickRegion(region.id)}
            >
              {region.name}
            </FilterChip>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className={cn(caption, 'border-y border-border text-muted-foreground')}>
                <th className="px-4 py-2.5 font-semibold">Lote</th>
                <th className="px-4 py-2.5 font-semibold">Padre</th>
                <th className="px-4 py-2.5 font-semibold">Madre</th>
                <th className="px-4 py-2.5 font-semibold">Sexo</th>
                <th className="px-4 py-2.5 font-semibold">Precio</th>
                <th className="px-4 py-2.5 font-semibold">Comprador</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lot) => (
                <SaleRow
                  key={lot.id}
                  lot={lot}
                  clients={clients}
                  live={active?.id === lot.id}
                  onOpen={() => setSelectedLot(lot)}
                />
              ))}
            </tbody>
          </table>
          {visible.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground">Ningún lote coincide con la búsqueda.</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
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
            onClick={() => setPage(current + 1)}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground disabled:text-muted-foreground"
          >
            Siguiente
          </button>
        </div>
      </section>
      )}

      {expanded
        ? createPortal(
            <BoardProjection
              boardRef={boardRef}
              title={auction.title || 'Sin subasta'}
              dates={[auction.seller, auction.dates].filter(Boolean).join(' · ')}
              lots={filtered}
              clients={clients}
              liveId={active?.id ?? null}
              prizes={prizes}
              fullscreen={fullscreen}
              onFill={fillScreen}
              onClose={closeBoard}
            />,
            document.body,
          )
        : null}

      {selectedLot
        ? createPortal(
            <LotInfoModal lot={selectedLot} clients={clients} onClose={() => setSelectedLot(null)} />,
            document.body,
          )
        : null}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className={cn(panelSm, 'p-4')}>
      <p className={cn(eyebrow, 'text-muted-foreground')}>{label}</p>
      <p className="mt-2 font-display text-lg font-bold tabular text-foreground sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{hint}</p>
    </div>
  )
}

function PrizeStat({
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
    <div className={cn(panelSm, 'p-4')}>
      <p className={cn(eyebrow, 'text-primary')}>{title}</p>
      <p className="mt-2 font-display text-lg font-bold tabular text-foreground sm:text-2xl">
        {lot ? `$${formatUSD(displayedPrice(lot))}` : '—'}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
        {lot ? `Lote ${lot.order}${client ? ` · ${client.name}` : ''}` : 'Sin venta cerrada'}
      </p>
    </div>
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
    <tr
      role="button"
      tabIndex={0}
      aria-label={`Ver información del lote ${lot.order}: ${lot.title}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      className="cursor-pointer border-b border-border transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none last:border-b-0"
    >
      <td className="px-4 py-3 font-semibold tabular text-foreground">
        <LotNumber lot={lot} live={live} />
      </td>
      <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
        {lot.sire || '—'}
      </td>
      <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
        {lot.dam || '—'}
      </td>
      <td className="px-4 py-3 font-medium text-muted-foreground">
        {lot.category === 'macho' ? 'Macho' : 'Hembra'}
      </td>
      <td className="px-4 py-3 font-semibold tabular text-foreground">
        {price > 0 ? formatUSD(price) : '—'}
      </td>
      <td
        className={cn(
          'px-4 py-3 font-semibold',
          region ? regionInkClass[region.ink] : 'text-muted-foreground',
        )}
      >
        {client?.name ?? 'Sin adjudicar'}
      </td>
    </tr>
  )
}

function LotInfoModal({ lot, clients, onClose }: { lot: Lot; clients: Client[]; onClose: () => void }) {
  const client = clientOfLot(lot, clients)
  const photos = lot.images?.filter(Boolean) ?? []
  const image = photos[0] || lot.image || '/placeholder.svg'
  const amount = displayedPrice(lot)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
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
            autoFocus
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
                  <p className="mt-2 text-sm text-muted-foreground">{[lot.color, lot.seller].filter(Boolean).join(' · ')}</p>
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

function LotNumber({ lot, live }: { lot: Lot; live: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {live ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
      {lot.order}
    </span>
  )
}

function FilterChip({
  active,
  ink,
  onClick,
  children,
}: {
  active: boolean
  ink?: RegionInk
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold',
        ink
          ? active
            ? regionChipClass[ink].active
            : regionChipClass[ink].idle
          : active
            ? 'bg-foreground text-background'
            : 'bg-surface-2 text-muted-foreground',
      )}
    >
      {children}
    </button>
  )
}
