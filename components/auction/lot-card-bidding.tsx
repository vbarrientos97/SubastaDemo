import Link from 'next/link'
import { Clock, ChevronRight } from 'lucide-react'
import { displayedPrice, isActiveLot, isUrgentLot, type Lot } from '@/lib/domain/lot'
import { formatUSD } from '@/lib/format'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { Countdown } from '@/components/auction/countdown'
import { BidGate } from '@/components/auction/bid-gate'

export function LotCardBidding({ lot, compact, lotHref }: { lot: Lot; compact: boolean; lotHref: string }) {
  const active = isActiveLot(lot)
  const urgent = isUrgentLot(lot)
  return (
    <>
      {active && (
        <div className={cn('flex flex-col', compact ? 'gap-2' : 'flex-1 gap-2')}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <div className="min-w-0">
              <span className={cn(eyebrow, 'block text-muted-foreground')}>
                {urgent ? 'Puja líder' : 'Puja actual'}
              </span>
              <span className="block font-display text-base font-bold tabular text-foreground">
                ${formatUSD(lot.currentBid)}
                <span className="ml-1 text-xs font-semibold text-muted-foreground">USD</span>
              </span>
              {lot.leader ? (
                <p className="mt-1 flex w-fit max-w-full items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success ring-1 ring-success/25">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  <span className="truncate">{lot.leader}</span>
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <span
                className={cn(
                  eyebrow,
                  'flex items-center justify-end gap-1 whitespace-nowrap',
                  urgent ? 'text-primary' : 'text-warning',
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                {urgent ? 'Cierre inminente' : 'Cierre lote'}
              </span>
              <Countdown
                seconds={lot.secondsLeft ?? 0}
                className={cn(
                  'font-display text-base font-bold',
                  urgent ? 'text-primary' : 'text-warning',
                )}
              />
            </div>
          </div>
          <div className={compact ? undefined : 'mt-auto'}>
            <BidGate lot={lot} />
          </div>
        </div>
      )}

      {lot.status === 'closed' && (
        <div className="flex flex-1 flex-col gap-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <span className={cn(eyebrow, 'block text-muted-foreground')}>{('buyerOutcome' in lot && lot.buyerOutcome === 'won') ? 'Ganado por ti' : 'Vendido'}</span>
              <span className="font-display text-lg font-bold tabular text-success">
                ${formatUSD(displayedPrice(lot))}{' '}
                <span className="text-xs font-semibold text-muted-foreground">USD</span>
              </span>
            </div>
          </div>

          {lot.bids && lot.bids.length > 0 ? (
            <ul className="overflow-hidden rounded-2xl border border-border">
              {lot.bids.slice(0, 3).map((bid, index) => (
                <li
                  key={`${bid.bidder}-${bid.time}-${index}`}
                  className={cn(
                    'flex items-center justify-between gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0',
                    index === 0 ? 'bg-success-soft dark:bg-success/10' : 'bg-surface-2 dark:bg-background/40',
                  )}
                >
                  <span className="min-w-0 truncate font-medium text-foreground">{bid.bidder}</span>
                  <span
                    className={cn(
                      'shrink-0 font-bold tabular',
                      index === 0 ? 'text-success' : 'text-foreground',
                    )}
                  >
                    ${formatUSD(bid.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <Link
            href={lotHref}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            Ver resultado del lote
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </>
  )
}
