'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Lot, SexFilter } from '@/lib/domain/lot'
import {
  categoryLabel,
  countByCategory,
  filterLots,
  lotsForTab,
  paginateLots,
  parseAmount,
  parseCatalogTab,
  parseLotSort,
  sortLots,
  type CatalogTab,
  type LotSort,
} from '@/lib/domain/lot'
import { caption, panelSm, selectCompactField } from '@/lib/styles'
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
        framed ? 'rounded-xl border border-input bg-surface px-3.5 py-2.5' : 'px-2',
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
}: {
  value: SexFilter
  onChange: (value: SexFilter) => void
  counts: { todos: number; hembra: number; macho: number }
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
          : 'no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4',
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
            'text-sm font-semibold transition',
            variant === 'segmented' ? 'rounded-lg px-3 py-1.5' : 'shrink-0 rounded-full px-4 py-1.5',
            value === item.key
              ? 'bg-black text-white dark:bg-primary dark:text-primary-foreground'
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
        layout === 'grid' && 'rounded-xl border border-input bg-surface px-3 py-2',
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
          'bg-transparent text-sm font-semibold tabular text-foreground outline-none placeholder:text-muted-foreground/50',
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

function CatalogTabs({
  value,
  onChange,
}: {
  value: CatalogTab
  onChange: (value: CatalogTab) => void
}) {
  const tabs: { key: CatalogTab; label: string }[] = [
    { key: 'abierta', label: 'Subasta abierta' },
    { key: 'proxima', label: 'Próxima subasta' },
  ]

  return (
    <div
      className="flex gap-1 rounded-2xl bg-surface-2 p-1"
      role="tablist"
      aria-label="Catálogo"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={value === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition',
            value === tab.key
              ? 'bg-black text-white shadow-sm dark:bg-surface dark:text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function Catalog({
  lots,
  openAuctionId,
  upcomingAuctionId,
}: {
  lots: Lot[]
  openAuctionId?: string
  upcomingAuctionId?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = parseCatalogTab(searchParams.get('tab'))
  const query = searchParams.get('q') ?? ''
  const sex = (searchParams.get('sexo') as SexFilter | null) ?? 'todos'
  const minPrice = searchParams.get('min') ?? ''
  const maxPrice = searchParams.get('max') ?? ''
  const sort = parseLotSort(searchParams.get('orden'))
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1

  const [priceOpen, setPriceOpen] = useState(false)
  const priceActive = minPrice !== '' || maxPrice !== ''

  function setParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === '' || (key === 'tab' && value === 'abierta') || (key === 'sexo' && value === 'todos') || (key === 'orden' && value === 'orden') || (key === 'page' && value === '1')) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const scoped = useMemo(() => lotsForTab(lots, tab), [lots, tab])
  const counts = useMemo(() => countByCategory(scoped), [scoped])
  const filtered = useMemo(
    () =>
      sortLots(
        filterLots(scoped, {
          text: query,
          sex: sex === 'hembra' || sex === 'macho' ? sex : 'todos',
          min: parseAmount(minPrice),
          max: parseAmount(maxPrice),
        }),
        sort,
      ),
    [scoped, query, sex, minPrice, maxPrice, sort],
  )
  const paged = useMemo(() => paginateLots(filtered, page, PAGE_SIZE), [filtered, page])

  return (
    <div className="flex flex-col gap-4">
      <CatalogTabs
        value={tab}
        onChange={(value) => {
          const targetAuctionId = value === 'abierta' ? openAuctionId : upcomingAuctionId
          const targetPath = targetAuctionId ? `/subasta/${targetAuctionId}` : pathname
          router.push(`${targetPath}?tab=${value}`, { scroll: false })
        }}
      />

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
          <label className="shrink-0 text-sm">
            <span className="sr-only">Orden</span>
            <select
              value={sort}
              onChange={(event) => setParams({ orden: event.target.value as LotSort, page: '1' })}
              className={selectCompactField}
            >
              <option value="orden">Por lote</option>
              <option value="precio-asc">Precio ↑</option>
              <option value="precio-desc">Precio ↓</option>
            </select>
          </label>
          <div className="relative shrink-0">
            <button
              type="button"
              aria-expanded={priceOpen}
              onClick={() => setPriceOpen((open) => !open)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
                priceOpen || priceActive
                  ? 'bg-black text-white dark:bg-primary dark:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Precio
            </button>
            {priceOpen ? (
              <div className={cn(panelSm, 'absolute right-0 top-full z-20 mt-2 p-3 shadow-lg')}>
                <PriceFields
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPrice={(value) => setParams({ min: value, page: '1' })}
                  onMaxPrice={(value) => setParams({ max: value, page: '1' })}
                  layout="row"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex items-center gap-2">
          <LotSearch
            value={query}
            onChange={(value) => setParams({ q: value, page: '1' })}
            framed
          />
          <button
            type="button"
            aria-label="Filtros de precio"
            aria-expanded={priceOpen}
            onClick={() => setPriceOpen((open) => !open)}
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-surface transition',
              priceOpen || priceActive
                ? 'border-black text-black dark:border-primary dark:text-primary'
                : 'border-input text-muted-foreground hover:text-foreground',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
        {priceOpen ? (
          <PriceFields
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPrice={(value) => setParams({ min: value, page: '1' })}
            onMaxPrice={(value) => setParams({ max: value, page: '1' })}
            layout="grid"
          />
        ) : null}
        <SexFilters
          value={sex === 'hembra' || sex === 'macho' ? sex : 'todos'}
          onChange={(value) => setParams({ sexo: value, page: '1' })}
          counts={counts}
          variant="chips"
        />
      </div>

      {paged.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No hay lotes que coincidan con tu búsqueda.
        </p>
      ) : (
        <>
          <div className="lg:hidden">
            <LotMobileList lots={paged.items} />
          </div>
          <div className="hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3">
            {paged.items.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
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
