'use client'

import { useState } from 'react'
import type { Lot } from '@/lib/domain/lot'
import { isActiveLot } from '@/lib/domain/lot'
import { LotCard } from '@/components/auction/lot-card'
import { LotMiniRow } from '@/components/auction/lot-mini-list'
import { CompetitionPanel } from '@/components/favorites/competition-panel'

export function AuctionFloor({ lots }: { lots: Lot[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    lots.find((lot) => lot.id === selectedId) ??
    lots.find(isActiveLot) ??
    lots[0]

  if (!selected) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No hay lotes que coincidan con tu búsqueda.
      </p>
    )
  }

  return (
    <div className="grid w-full grid-cols-[minmax(16rem,20rem)_22rem_minmax(16rem,1fr)] items-start gap-5">
      <ul className="thin-scrollbar sticky top-20 flex max-h-[calc(100svh-8rem)] min-h-0 flex-col gap-1 self-start overflow-y-auto overscroll-contain rounded-3xl bg-surface/50 p-1.5">
        {lots.map((lot) => {
          const chosen = lot.id === selected.id
          return (
            <li key={lot.id}>
              <LotMiniRow lot={lot} selected={chosen} onSelect={() => setSelectedId(lot.id)} />
            </li>
          )
        })}
      </ul>

      <LotCard key={selected.id} lot={selected} compact />
      <CompetitionPanel lot={selected} />
    </div>
  )
}
