'use client'

import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { AuctionReports } from '@/components/admin/auction-reports'
import { useSession } from '@/components/auth/session-provider'
import { eyebrow, panel, selectField } from '@/lib/styles'
import { cn } from '@/lib/utils'

export default function ReportsPage() {
  const { state } = useSession()
  const [selectedAuctionId, setSelectedAuctionId] = useState('')

  if (!state) return <p className="text-sm text-muted-foreground">Cargando…</p>

  const selectedAuction = state.auctions.find((auction) => auction.id === selectedAuctionId)

  return (
    <section className="flex flex-col gap-5 sm:gap-6">
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[30px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <p className={cn(eyebrow, 'text-red-300')}>Administración</p>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">Reportes</h1>
          <p className="mt-2 max-w-xl text-sm text-white/65">Elige una subasta para consultar sus ventas y resultados por zona.</p>
        </div>
      </header>

      <section className={cn(panel, 'grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] sm:items-end sm:p-5')}>
        <div>
          <label htmlFor="report-auction" className={cn(eyebrow, 'mb-2 block text-muted-foreground')}>Subasta</label>
          <select
            id="report-auction"
            className={selectField}
            value={selectedAuctionId}
            onChange={(event) => setSelectedAuctionId(event.target.value)}
          >
            <option value="">Selecciona una subasta</option>
            {state.auctions.map((auction) => (
              <option key={auction.id} value={auction.id}>{auction.title}</option>
            ))}
          </select>
        </div>
        {selectedAuction ? <p className="text-sm text-muted-foreground">Reporte de <span className="font-semibold text-foreground">{selectedAuction.title}</span></p> : null}
      </section>

      {selectedAuction ? (
        <AuctionReports auctionId={selectedAuction.id} title={selectedAuction.title} />
      ) : (
        <section className={cn(panel, 'flex flex-col items-center px-5 py-12 text-center')}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BarChart3 className="h-5 w-5" /></span>
          <h2 className="mt-4 font-display text-base font-bold text-foreground sm:text-lg">Selecciona una subasta</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">El resumen de ventas y los lotes adjudicados aparecerán aquí.</p>
        </section>
      )}
    </section>
  )
}
