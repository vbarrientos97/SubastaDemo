'use client'

import { useEffect, useRef, useState } from 'react'
import { useModalFocus } from '@/hooks/use-modal-focus'
import { createPortal, flushSync } from 'react-dom'
import { LotInfoModal } from '@/components/admin/lot-info-modal'
import { BoardProjection } from '@/components/admin/board-projection'
import { BoardFilters } from '@/components/admin/board-filters'
import { BoardSalesTable } from '@/components/admin/board-sales-table'
import { clientOfLot, type Client } from '@/lib/domain/account'
import {
  boardLots,
  floorLot,
  prizeLots,
  remateProgress,
  salesTotal,
  type BoardQuery,
} from '@/lib/domain/board'
import { displayedPrice, type Lot } from '@/lib/domain/lot'
import { formatUSD } from '@/lib/format'
import { eyebrow, panel, panelSm } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { useSession } from '@/components/auth/session-provider'

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
  useModalFocus(boardRef, expanded, closeBoard)

  useEffect(() => {
    if (!expanded) return
    function onFullscreen() {
      setFullscreen(document.fullscreenElement === boardRef.current)
      if (!document.fullscreenElement) setExpanded(false)
    }

    document.addEventListener('fullscreenchange', onFullscreen)
    return () => {
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

  function openBoard() {
    flushSync(() => setExpanded(true))
    const node = boardRef.current
    if (node && document.fullscreenElement !== node) {
      void node.requestFullscreen?.().catch(() => { })
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
    void node.requestFullscreen?.().catch(() => { })
  }

  return (
    <div className="flex flex-col gap-4">
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
          <BoardFilters query={{ text, regionId }} onQueryChange={(query) => { setText(query.text); setRegionId(query.regionId); setPage(0) }} range={{ from, to, total: filtered.length }} onExpand={openBoard} />
          <BoardSalesTable lots={visible} clients={clients} liveId={active?.id ?? null} onOpen={setSelectedLot} current={current} pages={pages} onPageChange={setPage} />
        </section>
      )}

      {expanded
        ? createPortal(
          <BoardProjection
            boardRef={boardRef}
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
