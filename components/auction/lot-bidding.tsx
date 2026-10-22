import { Gavel, Trophy } from 'lucide-react'
import { displayedPrice, isActiveLot, type Lot } from '@/lib/domain/lot'
import type { BuyerLot } from '@/lib/domain/buyer-lot'
import { formatUSD } from '@/lib/format'
import { eyebrow, panel, panelSm } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { BidGate } from '@/components/auction/bid-gate'

export function LotBidPanel({ lot }: { lot: Lot | BuyerLot }) {
  const active = isActiveLot(lot)
  return (
    <aside className="px-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:px-0">
      {active ? (
        <section className={cn(panel, 'flex flex-col gap-2 p-4')}>
          <div className="flex items-baseline justify-between">
            <span className={cn(eyebrow, 'text-muted-foreground')}>
              Realiza tu puja
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Mín ${formatUSD(lot.currentBid + lot.minIncrement)}
            </span>
          </div>
          <BidGate lot={lot} size="lg" promptLogin />
        </section>
      ) : lot.status === 'closed' ? (
        <section className="flex items-center gap-3 rounded-3xl border border-success/30 bg-success/10 p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/20 text-success">
            <Trophy className="h-6 w-6" />
          </span>
          <div>
            <p className={cn(eyebrow, 'text-muted-foreground')}>
              {('buyerOutcome' in lot && lot.buyerOutcome === 'won') ? 'Ganado por ti' : 'Vendido'}
            </p>
            <p className="font-display text-xl font-bold tabular text-success sm:text-2xl">
              ${formatUSD(lot.finalPrice ?? 0)}{' '}
              <span className="text-xs font-semibold text-muted-foreground">USD</span>
            </p>
          </div>
        </section>
      ) : (
        <BidGate lot={lot} size="lg" interactive={false} promptLogin />
      )}
    </aside>

  )
}

export function LotBidHistory({ lot }: { lot: Lot | BuyerLot }) {
  const active = isActiveLot(lot)
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
          Pujas
          <span className="mt-1 block h-1 w-10 rounded-full bg-primary" />
        </h2>
        {active && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            En vivo
          </span>
        )}
      </div>

      <div className={cn(panelSm, 'p-4')}>
        <span className={cn(eyebrow, 'text-muted-foreground')}>
          {active ? 'Puja líder actual' : lot.status === 'closed' ? (('buyerOutcome' in lot && lot.buyerOutcome === 'won') ? 'Ganado por ti' : 'Vendido') : 'Puja ganadora'}
        </span>
        <p className="font-display text-2xl font-bold tabular text-success sm:text-3xl lg:text-4xl">
          ${formatUSD(displayedPrice(lot), { decimals: true })}
          <span className="ml-1.5 text-sm font-semibold text-muted-foreground">USD</span>
        </p>
        {lot.leader && (
          <div className="mt-3">
            <span className={cn(eyebrow, 'flex items-center gap-1.5 text-muted-foreground')}>
              <Gavel className="h-3.5 w-3.5" />
              Liderando por
            </span>
            <span className="mt-1.5 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-sm font-semibold text-success ring-1 ring-success/25">
              <span className="h-2 w-2 rounded-full bg-success" />
              {lot.leader}
            </span>
          </div>
        )}
      </div>

      {lot.bids && lot.bids.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className={cn(eyebrow, 'grid grid-cols-[1fr_auto_auto] gap-3 border-b border-border bg-surface-2 px-4 py-2.5 text-muted-foreground')}>
            <span>Pujador</span>
            <span className="text-right">Importe</span>
            <span className="text-right">Hora</span>
          </div>
          <ul>
            {lot.bids.map((bid, i) => {
              const leading = i === 0
              return (
                <li
                  key={i}
                  className={cn(
                    'grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0',
                    leading ? 'bg-success/5' : 'bg-surface',
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center gap-2 truncate font-medium',
                      leading ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {leading && <span className="h-4 w-1 shrink-0 rounded-full bg-success" />}
                    <span className="truncate">{bid.bidder}</span>
                  </span>
                  <span
                    className={cn(
                      'text-right font-bold tabular',
                      leading ? 'text-success' : 'text-foreground',
                    )}
                  >
                    ${formatUSD(bid.amount, { decimals: true })}
                  </span>
                  <span className="text-right text-[11px] leading-tight text-muted-foreground">
                    {bid.date}
                    <br />
                    {bid.time}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
