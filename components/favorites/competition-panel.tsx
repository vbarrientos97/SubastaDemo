'use client'

import { Heart, Users } from 'lucide-react'
import type { Lot } from '@/lib/domain/lot'
import { competingBidders, followerCount, isActiveLot } from '@/lib/domain/lot'
import { formatUSD } from '@/lib/format'
import { eyebrow, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function CompetitionPanel({ lot }: { lot: Lot }) {
  if (isActiveLot(lot)) return <ActiveRace lot={lot} />
  if (lot.status === 'upcoming') return <UpcomingInterest lot={lot} />
  return <ClosedRace lot={lot} />
}

function ActiveRace({ lot }: { lot: Lot }) {
  const bids = lot.bids ?? []
  const rivals = competingBidders(lot)

  return (
    <aside className={cn(panel, 'sticky top-24 flex flex-col gap-4 p-4')}>
      <div>
        <p className={cn(eyebrow, 'text-primary')}>Ventana activa</p>
        <h3 className="mt-1 font-display text-lg font-bold text-foreground">Compitiendo ahora</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {rivals === 0
            ? 'Nadie ha pujado todavía'
            : `${rivals} ${rivals === 1 ? 'pujador' : 'pujadores'} · ${bids.length} ${bids.length === 1 ? 'puja' : 'pujas'}`}
        </p>
      </div>

      {bids.length === 0 ? (
        <p className="rounded-2xl bg-background/40 px-3 py-4 text-sm text-muted-foreground">
          Sé el primero en entrar a este lote.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {bids.slice(0, 5).map((bid, index) => (
            <li
              key={`${bid.bidder}-${bid.time}-${index}`}
              className={cn(
                'flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5',
                index === 0 ? 'bg-success/10 ring-1 ring-success/25' : 'bg-background/40',
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {bid.bidder}
                </span>
                <span className={cn(eyebrow, index === 0 ? 'text-success' : 'text-muted-foreground')}>
                  {index === 0 ? 'Lidera' : bid.time}
                </span>
              </span>
              <span
                className={cn(
                  'shrink-0 font-display text-sm font-bold tabular',
                  index === 0 ? 'text-success' : 'text-foreground',
                )}
              >
                ${formatUSD(bid.amount)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  )
}

function UpcomingInterest({ lot }: { lot: Lot }) {
  const saved = followerCount(lot)

  return (
    <aside className={cn(panel, 'sticky top-24 flex flex-col gap-4 p-4')}>
      <div>
        <p className={cn(eyebrow, 'text-warning')}>Próxima subasta</p>
        <h3 className="mt-1 font-display text-lg font-bold text-foreground">Todavía no abre</h3>
        <p className="mt-2 text-sm text-muted-foreground">{lot.opensAtLabel ?? 'Fecha por confirmar'}</p>
      </div>
      <p className="flex items-center gap-2 rounded-2xl bg-background/40 px-3 py-3 text-sm text-muted-foreground">
        <Heart className="h-4 w-4 shrink-0 text-primary" />
        {saved} personas lo guardaron como favorito
      </p>
    </aside>
  )
}

function ClosedRace({ lot }: { lot: Lot }) {
  return (
    <aside className={cn(panel, 'sticky top-24 flex flex-col gap-3 p-4')}>
      <div>
        <p className={cn(eyebrow, 'text-muted-foreground')}>Competencia cerrada</p>
        <h3 className="mt-1 font-display text-lg font-bold text-foreground">Ya se adjudicó</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Paleta #{lot.soldToPaddle ?? '—'} se llevó el lote en{' '}
        <span className="font-semibold text-success">${formatUSD(lot.finalPrice ?? lot.currentBid)}</span>.
      </p>
    </aside>
  )
}
