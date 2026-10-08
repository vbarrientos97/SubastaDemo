'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Lot } from '@/lib/domain/lot'
import { displayedPrice, isActiveLot } from '@/lib/domain/lot'
import { formatUSD } from '@/lib/format'
import { caption } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { LotCard } from '@/components/auction/lot-card'

export function LotMiniRow({
  lot,
  selected,
  expanded,
  onSelect,
}: {
  lot: Lot
  selected?: boolean
  expanded?: boolean
  onSelect: () => void
}) {
  const upcoming = lot.status === 'upcoming'

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-expanded={expanded}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-2xl px-2 py-2 text-left transition',
        selected ? 'bg-surface shadow-sm ring-1 ring-primary/35' : 'hover:bg-background/60',
      )}
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={lot.image || '/placeholder.svg'}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">
          Lote {String(lot.order).padStart(2, '0')}
        </span>
        <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
          {lot.sire ? <span className="block truncate">Padre {lot.sire}</span> : null}
          {lot.dam ? <span className="block truncate">Madre {lot.dam}</span> : null}
          {!lot.sire && !lot.dam ? <span className="block truncate">{lot.breed}</span> : null}
        </span>
      </span>
      <span className="w-16 shrink-0 text-right">
        {upcoming ? (
          <span className={cn(caption, 'text-warning')}>Pronto</span>
        ) : (
          <>
            <span className="block text-sm font-bold tabular text-foreground">
              ${formatUSD(displayedPrice(lot))}
            </span>
            {isActiveLot(lot) && lot.leader ? (
              <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-semibold text-success">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                <span className="truncate">{lot.leader}</span>
              </span>
            ) : (
              <span className={cn(caption, 'text-muted-foreground')}>
                {lot.status === 'closed' ? 'Vendido' : 'Puja'}
              </span>
            )}
          </>
        )}
      </span>
    </button>
  )
}

export function LotMobileList({ lots }: { lots: Lot[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (openId && !lots.some((lot) => lot.id === openId)) setOpenId(null)
  }, [lots, openId])

  useEffect(() => {
    if (!openId) return
    document.getElementById(`lot-expand-${openId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [openId])

  return (
    <ul className="flex flex-col gap-1 rounded-3xl bg-surface/50 p-1.5">
      {lots.map((lot) => {
        const open = lot.id === openId
        return (
          <li key={lot.id} className="flex flex-col gap-2">
            <LotMiniRow
              lot={lot}
              selected={open}
              expanded={open}
              onSelect={() => setOpenId((current) => (current === lot.id ? null : lot.id))}
            />
            {open ? (
              <div id={`lot-expand-${lot.id}`} className="scroll-mt-16">
                <LotCard lot={lot} />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
