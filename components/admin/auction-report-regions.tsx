'use client'

import { ChevronDown } from 'lucide-react'
import { clientOfLot, type Client } from '@/lib/domain/account'
import { lotsByZone } from '@/lib/domain/board'
import { displayedPrice } from '@/lib/domain/lot'
import { regions } from '@/lib/domain/region'
import { formatUSD } from '@/lib/format'
import { eyebrow, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { regionInk, regionInkClass, regionSwatchClass } from '@/components/admin/region-ink'

type ReportRegionGroup = ReturnType<typeof lotsByZone>[number] & {
  total: number
  region: (typeof regions)[number] | undefined
}

export function ReportRegionChart({ groups, maxZoneSales, ungroupedCount, ungroupedTotal }: {
  groups: ReportRegionGroup[]
  maxZoneSales: number
  ungroupedCount: number
  ungroupedTotal: number
}) {
  return (
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
            const ink = group.region ? regionInk[group.region.id] : undefined
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

      {ungroupedCount > 0 ? (
        <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
          ${formatUSD(ungroupedTotal)} en {ungroupedCount} {ungroupedCount === 1 ? 'lote adjudicado' : 'lotes adjudicados'} sin zona reconocida; incluido en el total vendido.
        </p>
      ) : null}
    </section>
  )
}

export function ReportRegionDetails({ groups, clients, soldCount }: {
  groups: ReportRegionGroup[]
  clients: Client[]
  soldCount: number
}) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className={cn(eyebrow, 'text-primary')}>Detalle</p>
          <h2 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">Lotes por zona</h2>
        </div>
        <span className="text-sm font-semibold tabular text-muted-foreground">{soldCount} vendidos</span>
      </header>

      {groups.map((group) => (
        <details key={group.id} className={cn(panel, 'group overflow-hidden')}>
          <summary className="flex list-none cursor-pointer items-center justify-between gap-3 bg-surface-2/60 px-4 py-3 marker:hidden transition hover:bg-accent/60 sm:px-5 [&::-webkit-details-marker]:hidden">
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', group.region ? regionSwatchClass[regionInk[group.region.id]] : 'bg-primary')} />
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
                    Lote {String(lot.order).padStart(2, '0')} · {lot.breed} · Color: {lot.color ?? '—'}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {clientOfLot(lot, clients)?.name ?? 'Comprador sin nombre'}
                  </span>
                </span>
                <span className="shrink-0 tabular font-semibold text-muted-foreground">${formatUSD(displayedPrice(lot))}</span>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  )
}
