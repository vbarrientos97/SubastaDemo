'use client'

import { BarChart3, ChevronDown, CircleDollarSign, PackageCheck } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { clientOfLot } from '@/lib/domain/account'
import { closedSales, lotsByZone, salesTotal } from '@/lib/domain/board'
import { displayedPrice } from '@/lib/domain/lot'
import { regions } from '@/lib/domain/region'
import { formatUSD } from '@/lib/format'
import { eyebrow, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { regionInkClass, regionSwatchClass } from '@/components/admin/region-ink'

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
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[30px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <p className={cn(eyebrow, 'text-red-300')}>Reporte de subasta</p>
          <h1 className="mt-2 max-w-3xl break-words font-display text-xl font-bold leading-tight sm:text-2xl">
            {title || 'Sin título'}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/65">
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
          accent="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <SummaryCard
          label="Lotes adjudicados"
          value={String(soldLots.length)}
          note={`de ${auctionLots.length} lotes registrados`}
          icon={PackageCheck}
          accent="text-primary"
          iconBg="bg-primary/10"
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
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-base font-bold text-foreground sm:text-lg">Aún no hay ventas cerradas</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Cuando se adjudiquen lotes, aquí aparecerán el resumen de ventas y su distribución por zona.
          </p>
        </section>
      ) : (
        <>
          <section className={cn(panel, 'p-4 sm:p-5')}>
            <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className={cn(eyebrow, 'text-primary')}>Distribución regional</p>
                <h2 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">Ventas por zona</h2>
              </div>
              <p className="text-xs font-medium text-muted-foreground">Monto de lotes adjudicados</p>
            </header>

            {groups.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No hay ventas con una zona de comprador asignada todavía.
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {groups.map((group) => {
                  const percentage = maxZoneSales > 0 ? (group.total / maxZoneSales) * 100 : 0
                  const ink = group.region?.ink
                  return (
                    <div key={group.id}>
                      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', ink ? regionSwatchClass[ink] : 'bg-primary')} />
                          <h3 className={cn('truncate text-sm font-bold', ink ? regionInkClass[ink] : 'text-foreground')}>
                            {group.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">{group.lots.length} {group.lots.length === 1 ? 'lote' : 'lotes'}</span>
                        </div>
                        <span className="tabular text-sm font-bold text-foreground">${formatUSD(group.total)}</span>
                      </div>
                      <div
                        className="h-2.5 overflow-hidden rounded-full bg-surface-2"
                        role="progressbar"
                        aria-label={`Ventas de ${group.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(percentage)}
                      >
                        <div
                          className={cn('h-full rounded-full transition-[width]', ink ? regionSwatchClass[ink] : 'bg-primary')}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {ungroupedLots.length > 0 ? (
              <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
                ${formatUSD(ungroupedTotal)} en {ungroupedLots.length} {ungroupedLots.length === 1 ? 'lote adjudicado' : 'lotes adjudicados'} sin zona reconocida; incluido en el total vendido.
              </p>
            ) : null}
          </section>

          <section className="flex flex-col gap-3">
            <header className="flex items-end justify-between gap-3 px-1">
              <div>
                <p className={cn(eyebrow, 'text-primary')}>Detalle</p>
                <h2 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">Lotes por zona</h2>
              </div>
              <span className="text-sm font-semibold tabular text-muted-foreground">{soldLots.length} vendidos</span>
            </header>

            {groups.map((group) => (
              <details key={group.id} className={cn(panel, 'group overflow-hidden')}>
                <summary className="flex list-none cursor-pointer items-center justify-between gap-3 bg-surface-2/60 px-4 py-3 marker:hidden transition hover:bg-accent/60 sm:px-5 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', group.region ? regionSwatchClass[group.region.ink] : 'bg-primary')} />
                    <h3 className="truncate font-display text-base font-bold text-foreground">{group.name}</h3>
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">{group.lots.length}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="tabular text-sm font-bold text-foreground">${formatUSD(group.total)}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <ul className="border-t border-border">
                  {group.lots.map((lot) => (
                    <li
                      key={lot.id}
                      className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0 sm:px-5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-foreground">
                          Lote {String(lot.order).padStart(2, '0')} · {lot.breed}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {clientOfLot(lot, state.clients)?.name ?? 'Comprador sin nombre'}
                        </span>
                      </span>
                      <span className="shrink-0 tabular font-semibold text-muted-foreground">${formatUSD(displayedPrice(lot))}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </section>
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
