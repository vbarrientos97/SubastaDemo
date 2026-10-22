'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Lot, LotColor, SexFilter } from '@/lib/domain/lot'
import {
  LOT_COLORS,
  countByCategory,
  filterLots,
  paginateLots,
  parseAmount,
  parseLotSort,
  sortLots,
} from '@/lib/domain/lot'
import { CatalogFilters } from '@/components/auction/catalog-filters'
import { LotCard } from '@/components/auction/lot-card'
import { LotMobileList } from '@/components/auction/lot-mini-list'

const PAGE_SIZE = 9

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
      <CatalogFilters values={{ query, sex, color, minPrice, maxPrice, sort }} counts={counts} publicView={publicView} buyerView={buyerView} onChange={setParams} />

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
