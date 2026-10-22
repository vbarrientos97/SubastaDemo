'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { LOT_COLORS, type LotColor, type LotSort, type SexFilter } from '@/lib/domain/lot'
import { filterTriggerClass, panelSm, selectCompactField } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { LotSearch, SexFilters, PriceFields } from '@/components/auction/catalog-filter-fields'

type CatalogControlProps = {
  values: { query: string; sex: SexFilter; color: LotColor | 'todos'; minPrice: string; maxPrice: string; sort: LotSort }
  counts: { todos: number; hembra: number; macho: number }
  publicView: boolean
  buyerView: boolean
  onChange: (patch: Record<string, string | null>) => void
}

type ResponsiveControlProps = CatalogControlProps & { filtersOpen: boolean; filtersActive: boolean; onToggle: () => void }

export function CatalogFilters({ values, counts, publicView, buyerView, onChange }: CatalogControlProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersActive = values.color !== 'todos' || (!publicView && (values.minPrice !== '' || values.maxPrice !== ''))
  const controls = { values, counts, publicView, buyerView, onChange, filtersOpen, filtersActive, onToggle: () => setFiltersOpen((open) => !open) }
  return (
    <>
      <DesktopCatalogFilters {...controls} />
      <MobileCatalogFilters {...controls} />
    </>
  )
}

function DesktopCatalogFilters({ values, counts, publicView, onChange: setParams, filtersOpen, filtersActive, onToggle }: ResponsiveControlProps) {
  const { query, sex, color, minPrice, maxPrice, sort } = values
  return (
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
            onClick={onToggle}
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

  )
}

function MobileCatalogFilters({ values, counts, publicView, buyerView, onChange: setParams, filtersOpen, filtersActive, onToggle }: ResponsiveControlProps) {
  const { query, sex, color, minPrice, maxPrice } = values
  return (
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
        onClick={onToggle}
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

  )
}
