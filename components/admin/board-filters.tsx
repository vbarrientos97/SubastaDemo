'use client'

import type { ReactNode } from 'react'
import { Maximize2, Search } from 'lucide-react'
import type { BoardQuery } from '@/lib/domain/board'
import { regions } from '@/lib/domain/region'
import { RegionSelect } from '@/components/admin/region-select'
import { regionInk, type RegionInk, regionChipClass } from '@/components/admin/region-ink'
import { field } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function BoardFilters({ query, onQueryChange, range, onExpand }: {
  query: BoardQuery
  onQueryChange: (query: BoardQuery) => void
  range: { from: number; to: number; total: number }
  onExpand: () => void
}) {
  const { text, regionId } = query
  const { from, to, total } = range
  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Pizarra del remate</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {from}–{to} de {total}
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <label className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={text}
              onChange={(event) => onQueryChange({ ...query, text: event.target.value })}
              placeholder="Lote o comprador"
              aria-label="Buscar lote o comprador"
              className={cn(field, 'pl-9')}
            />
          </label>
          <button
            type="button"
            onClick={onExpand}
            className="hidden shrink-0 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/25 hover:bg-foreground hover:text-background sm:inline-flex"
          >
            <Maximize2 className="h-4 w-4" />
            Ampliar
          </button>
        </div>
      </div>

      <div className="px-3 py-3 sm:hidden">
        <RegionSelect value={regionId} onChange={(regionId) => onQueryChange({ ...query, regionId })} />
      </div>
      <div className="hidden gap-2 overflow-x-auto px-4 py-3 sm:flex">
        <FilterChip active={regionId === 'todos'} onClick={() => onQueryChange({ ...query, regionId: 'todos' })}>
          Todos
        </FilterChip>
        {regions.map((region) => (
          <FilterChip
            key={region.id}
            active={regionId === region.id}
            ink={regionInk[region.id]}
            onClick={() => onQueryChange({ ...query, regionId: region.id })}
          >
            {region.name}
          </FilterChip>
        ))}
      </div>

    </>
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
