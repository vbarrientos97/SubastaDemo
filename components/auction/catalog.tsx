'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Lot, LotColor, SexFilter } from '@/lib/domain/lot'
import {
  LOT_COLORS,
  categoryLabel,
  countByCategory,
  filterLots,
  paginateLots,
  parseAmount,
  parseLotSort,
  sortLots,
  type LotSort,
} from '@/lib/domain/lot'
import { caption, filterTriggerClass, panelSm, selectCompactField } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { LotCard } from '@/components/auction/lot-card'
import { LotMobileList } from '@/components/auction/lot-mini-list'

const PAGE_SIZE = 9

function LotSearch({
  value,
  onChange,
  framed,
}: {
  value: string
  onChange: (value: string) => void
  framed?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 items-center gap-2.5',
        framed ? 'rounded-xl border border-input bg-field px-3.5 py-2.5 dark:bg-surface' : 'px-2',
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por lote, raza…"
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Buscar lotes"
      />
    </div>
  )
}

function SexFilters({
  value,
  onChange,
  counts,
  variant,
  className,
}: {
  value: SexFilter
  onChange: (value: SexFilter) => void
  counts: { todos: number; hembra: number; macho: number }
  className?: string
  variant: 'segmented' | 'chips'
}) {
  const filters: { key: SexFilter; label: string }[] = [
    { key: 'todos', label: `Todos (${counts.todos})` },
    { key: 'hembra', label: `${categoryLabel('hembra')} (${counts.hembra})` },
    { key: 'macho', label: `${categoryLabel('macho')} (${counts.macho})` },
  ]

  return (
    <div
      className={cn(
        variant === 'segmented'
          ? 'flex shrink-0 items-center rounded-xl bg-background/50 p-1'
          : 'grid min-w-0 grid-cols-3 gap-1',
        className,
      )}
      role="group"
      aria-label="Sexo"
    >
      {filters.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          aria-pressed={value === item.key}
          className={cn(
            'font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            variant === 'segmented'
              ? 'rounded-lg px-3 py-1.5 text-sm'
              : 'min-h-11 min-w-0 break-words rounded-full px-1.5 py-1.5 text-xs',
            value === item.key
              ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground'
              : variant === 'segmented'
                ? 'text-muted-foreground hover:text-foreground'
                : 'bg-surface-2 text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function PriceFields({
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  layout,
}: {
  minPrice: string
  maxPrice: string
  onMinPrice: (value: string) => void
  onMaxPrice: (value: string) => void
  layout: 'row' | 'grid'
}) {
  const fields = [
    { label: 'Desde', value: minPrice, onChange: onMinPrice, aria: 'Precio mínimo', placeholder: 'mín' },
    { label: 'Hasta', value: maxPrice, onChange: onMaxPrice, aria: 'Precio máximo', placeholder: 'máx' },
  ]

  const inputs = fields.map((field) => (
    <label
      key={field.label}
      className={cn(
        'flex items-center gap-2',
        layout === 'grid' && 'rounded-xl border border-input bg-field px-3 py-2 dark:bg-surface',
      )}
    >
      <span className={cn(caption, 'shrink-0 text-muted-foreground')}>{field.label}</span>
      <span className="text-sm font-semibold text-muted-foreground">$</span>
      <input
        inputMode="numeric"
        value={field.value}
        onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ''))}
        placeholder={field.placeholder}
        aria-label={field.aria}
        className={cn(
          'bg-transparent text-sm font-semibold tabular text-foreground outline-none placeholder:text-muted-foreground dark:placeholder:text-muted-foreground/50',
          layout === 'grid' ? 'w-full' : 'w-20',
        )}
      />
    </label>
  ))

  if (layout === 'row') {
    return (
      <div className="flex items-center gap-2">
        {inputs[0]}
        <span className="text-muted-foreground" aria-hidden>
          —
        </span>
        {inputs[1]}
      </div>
    )
  }

  return <div className="grid grid-cols-2 gap-2">{inputs}</div>
}

export function Catalog({
  lots,
  publicView = false,
  buyerView = false,
}: {
  lots: Lot[]
  publicView?: boolean
  buyerView?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const sex = (searchParams.get('sexo') as SexFilter | null) ?? 'todos'
  const rawColor = searchParams.get('color')
  const color: LotColor | 'todos' = LOT_COLORS.find((item) => item === rawColor) ?? 'todos'
  const minPrice = searchParams.get('min') ?? ''
  const maxPrice = searchParams.get('max') ?? ''
  const sort = parseLotSort(searchParams.get('orden'))
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1

  const [filtersOpen, setFiltersOpen] = useState(false)
  const priceActive = minPrice !== '' || maxPrice !== ''
  const filtersActive = color !== 'todos' || (!publicView && priceActive)

  function setParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === '' || (key === 'sexo' && value === 'todos') || (key === 'color' && value === 'todos') || (key === 'orden' && value === 'orden') || (key === 'page' && value === '1')) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const scoped = lots
  const counts = useMemo(() => countByCategory(scoped), [scoped])
  const filtered = useMemo(
    () =>
      sortLots(
        filterLots(scoped, {
          text: query,
          sex: sex === 'hembra' || sex === 'macho' ? sex : 'todos',
          color,
          min: publicView ? null : parseAmount(minPrice),
          max: publicView ? null : parseAmount(maxPrice),
        }),
        sort,
      ),
    [scoped, query, sex, color, minPrice, maxPrice, sort, publicView],
  )
  const paged = useMemo(() => paginateLots(filtered, page, PAGE_SIZE), [filtered, page])
  const returnTo = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ''}`

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden flex-col gap-3 lg:flex">
        <div className={cn(panelSm, 'flex items-center gap-3 p-2')}>
          <LotSearch
            value={query}
            onChange={(value) => setParams({ q: value, page: '1' })}
          />
          <SexFilters
            value={sex === 'hembra' || sex === 'macho' ? sex : 'todos'}
            onChange={(value) => setParams({ sexo: value, page: '1' })}
            counts={counts}
            variant="segmented"
          />
          {!publicView ? <label className="shrink-0 text-sm">
            <span className="sr-only">Orden</span>
            <select
              value={sort}
              onChange={(event) => setParams({ orden: event.target.value as LotSort, page: '1' })}
              className={selectCompactField}
            >
              <option value="orden">Por lote</option>
              {!publicView ? <option value="precio-asc">Precio ↑</option> : null}
              {!publicView ? <option value="precio-desc">Precio ↓</option> : null}
            </select>
          </label> : null}
          <div className="relative shrink-0">
            <button
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
                filtersOpen || filtersActive
                  ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Filtros
            </button>
            {filtersOpen ? (
              <div className={cn(panelSm, 'absolute right-0 top-full z-20 mt-2 flex min-w-64 flex-col gap-3 p-3 shadow-lg')}>
                <label className="flex flex-col gap-1 text-sm font-medium text-muted-foreground">
                  Color
                  <select value={color} onChange={(event) => setParams({ color: event.target.value, page: '1' })} className={selectCompactField + ' w-full'}>
                    <option value="todos">Todos los colores</option>
                    {LOT_COLORS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                {!publicView ? <PriceFields
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPrice={(value) => setParams({ min: value, page: '1' })}
                  onMaxPrice={(value) => setParams({ max: value, page: '1' })}
                  layout="row"
                /> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:hidden">
        <div className={cn('flex min-w-0 items-center', buyerView && 'col-span-2 pr-14')}>
          <LotSearch
            value={query}
            onChange={(value) => setParams({ q: value, page: '1' })}
            framed
          />
        </div>
          <button
            type="button"
            aria-label="Filtros"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
            className={cn(
              filterTriggerClass(filtersOpen || filtersActive),
              'col-start-2 h-11 w-11',
              buyerView ? 'row-start-2' : 'row-start-1',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        {filtersOpen ? <div className={cn(panelSm, 'col-span-2 flex flex-col gap-3 p-3', buyerView ? 'row-start-3' : 'row-start-2')}>
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-input bg-field px-3 text-sm dark:bg-surface">
            <span className="shrink-0 font-medium text-muted-foreground">Color</span>
            <select value={color} onChange={(event) => setParams({ color: event.target.value, page: '1' })} className="min-w-0 flex-1 bg-transparent font-semibold text-foreground outline-none">
              <option value="todos">Todos</option>
              {LOT_COLORS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          {!publicView ? <PriceFields
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPrice={(value) => setParams({ min: value, page: '1' })}
            onMaxPrice={(value) => setParams({ max: value, page: '1' })}
            layout="grid"
          /> : null}
        </div> : null}
        <SexFilters
          value={sex === 'hembra' || sex === 'macho' ? sex : 'todos'}
          onChange={(value) => setParams({ sexo: value, page: '1' })}
          counts={counts}
          variant="chips"
          className={buyerView ? 'col-start-1 row-start-2' : 'col-span-2'}
        />
      </div>

      {paged.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No hay lotes que coincidan con tu búsqueda.
        </p>
      ) : (
        <>
          <div className="lg:hidden">
            <LotMobileList lots={paged.items} publicView={publicView} returnTo={returnTo} />
          </div>
          <div className="hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3">
            {paged.items.map((lot) => (
              <LotCard key={lot.id} lot={lot} publicView={publicView} returnTo={returnTo} />
            ))}
          </div>
        </>
      )}

      {paged.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={paged.page <= 1}
            onClick={() => setParams({ page: String(paged.page - 1) })}
            className="rounded-xl border border-border px-3 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            {paged.page} / {paged.totalPages}
          </span>
          <button
            type="button"
            disabled={paged.page >= paged.totalPages}
            onClick={() => setParams({ page: String(paged.page + 1) })}
            className="rounded-xl border border-border px-3 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  )
}
