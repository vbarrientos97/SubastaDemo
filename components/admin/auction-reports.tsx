'use client'

import { BarChart3, CircleDollarSign, PackageCheck } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { closedSales, lotsByZone, salesTotal } from '@/lib/domain/board'
import { displayedPrice } from '@/lib/domain/lot'
import { regions } from '@/lib/domain/region'
import { formatUSD } from '@/lib/format'
import { eyebrow, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { ReportRegionChart, ReportRegionDetails } from '@/components/admin/auction-report-regions'

export function AuctionReports({ auctionId, title }: { auctionId: string; title: string }) {
  const { state } = useSession()
  if (!state) return <p className="text-sm text-muted-foreground">Cargando…</p>

  const auctionLots = state.lots.filter((lot) => lot.auctionId === auctionId)
  const soldLots = closedSales(auctionLots)
  const totalSold = salesTotal(soldLots)
  const averageSale = soldLots.length > 0 ? totalSold / soldLots.length : null
  const groups = lotsByZone(soldLots, state.clients)
    .map((group) => ({
      ...group,
      lots: group.lots.slice().sort((a, b) => a.order - b.order),
      total: group.lots.reduce((sum, lot) => sum + displayedPrice(lot), 0),
      region: regions.find((region) => region.id === group.id),
    }))
    .sort((a, b) => b.total - a.total)
  const groupedLotIds = new Set(groups.flatMap((group) => group.lots.map((lot) => lot.id)))
  const ungroupedLots = soldLots.filter((lot) => !groupedLotIds.has(lot.id))
  const ungroupedTotal = ungroupedLots.reduce((sum, lot) => sum + displayedPrice(lot), 0)
  const maxZoneSales = Math.max(0, ...groups.map((group) => group.total))

  return (
    <section className="flex flex-col gap-5 sm:gap-6">
      <header className="relative overflow-hidden rounded-3xl bg-surface px-5 py-6 text-foreground dark:bg-slate-950 dark:text-white sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[30px] border-foreground/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
        <div className="relative">
          <p className={cn(eyebrow, 'text-primary dark:text-red-300')}>Reporte de subasta</p>
          <h1 className="mt-2 max-w-3xl break-words font-display text-xl font-bold leading-tight sm:text-2xl">
            {title || 'Sin título'}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground dark:text-white/65">
            Resumen de ventas cerradas y distribución de compradores por zona.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total vendido"
          value={`$${formatUSD(totalSold)}`}
          note="En lotes adjudicados"
          icon={CircleDollarSign}
          accent="text-success dark:text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <SummaryCard
          label="Lotes adjudicados"
          value={String(soldLots.length)}
          note={`de ${auctionLots.length} lotes registrados`}
          icon={PackageCheck}
          accent="text-primary"
          iconBg="bg-destructive-soft dark:bg-primary/10"
        />
        <SummaryCard
          label="Precio promedio"
          value={averageSale == null ? '—' : `$${formatUSD(averageSale, { decimals: true })}`}
          note="Por lote adjudicado"
          icon={BarChart3}
          accent="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-500/10"
        />
      </div>

      {soldLots.length === 0 ? (
        <section className={cn(panel, 'flex flex-col items-center px-5 py-12 text-center')}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive-soft text-destructive dark:bg-primary/10 dark:text-primary">
            <BarChart3 className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-base font-bold text-foreground sm:text-lg">Aún no hay ventas cerradas</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Cuando se adjudiquen lotes, aquí aparecerán el resumen de ventas y su distribución por zona.
          </p>
        </section>
      ) : (
        <>
          <ReportRegionChart groups={groups} maxZoneSales={maxZoneSales} ungroupedCount={ungroupedLots.length} ungroupedTotal={ungroupedTotal} />
          <ReportRegionDetails groups={groups} clients={state.clients} soldCount={soldLots.length} />
        </>
      )}
    </section>
  )
}

function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
  iconBg,
}: {
  label: string
  value: string
  note: string
  icon: React.ElementType
  accent: string
  iconBg: string
}) {
  return (
    <article className={cn(panel, 'flex min-w-0 items-start justify-between gap-3 p-4 sm:p-5')}>
      <div className="min-w-0">
        <p className={cn(eyebrow, 'text-muted-foreground')}>{label}</p>
        <p className="mt-2 truncate font-display text-lg font-bold tabular text-foreground sm:text-2xl">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{note}</p>
      </div>
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconBg, accent)}>
        <Icon className="h-5 w-5" />
      </span>
    </article>
  )
}
