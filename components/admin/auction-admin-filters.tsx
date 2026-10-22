'use client'

import { cn } from '@/lib/utils'
import { field } from '@/lib/styles'
import { AuctionDateFilter, type DateRange } from '@/components/admin/auction-date-filter'

export type AuctionFilters = { name: string; location: string; date: DateRange | null }

export function AuctionAdminFilters({ filters, onChange, open, hasFilters, onClear }: {
  filters: AuctionFilters
  onChange: (filters: AuctionFilters) => void
  open: boolean
  hasFilters: boolean
  onClear: () => void
}) {
  return (
    <div id="auction-filters" hidden={!open} className={cn('gap-2 border-b border-border p-3 sm:grid-cols-3 sm:p-4', open ? 'grid' : 'hidden')}>
      <label className="sr-only" htmlFor="auction-filter-name">Filtrar por nombre</label>
      <input
        id="auction-filter-name"
        type="search"
        value={filters.name}
        onChange={(event) => onChange({ ...filters, name: event.target.value })}
        placeholder="Nombre de subasta"
        className={field}
      />
      <label className="sr-only" htmlFor="auction-filter-location">Filtrar por lugar</label>
      <input
        id="auction-filter-location"
        type="search"
        value={filters.location}
        onChange={(event) => onChange({ ...filters, location: event.target.value })}
        placeholder="Lugar"
        className={field}
      />
      <AuctionDateFilter value={filters.date} onChange={(date) => onChange({ ...filters, date })} fieldClassName={cn(field, 'min-h-[42px] pr-10')} />
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="min-h-10 justify-self-start rounded-lg px-3 text-sm font-semibold text-primary hover:bg-destructive-soft dark:hover:bg-primary/10 sm:col-span-3"
        >
          Limpiar filtros
        </button>
      ) : null}
    </div>
  )
}
