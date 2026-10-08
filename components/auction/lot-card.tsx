import Link from 'next/link'
import Image from 'next/image'
import { Scale, Tag, Clock, ChevronRight, Heart } from 'lucide-react'
import type { Lot } from '@/lib/domain/lot'
import { displayedPrice, followerCount, isActiveLot, isUrgentLot } from '@/lib/domain/lot'
import { formatUSD, formatKg } from '@/lib/format'
import { caption, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/auction/status-badge'
import { FavoriteButton } from '@/components/auction/favorite-button'
import { Countdown } from '@/components/auction/countdown'
import { BidGate } from '@/components/auction/bid-gate'
import { NotifyOpenButton } from '@/components/auction/notify-open-button'
import { SoldStamp } from '@/components/auction/sold-stamp'

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="leading-tight">
        <span className={cn(caption, 'block text-muted-foreground')}>
          {label}
        </span>
        <span className={cn('block text-xs font-bold', accent && 'text-success')}>{value}</span>
      </span>
    </div>
  )
}

export function LotCard({ lot, compact = false }: { lot: Lot; favorite?: boolean; compact?: boolean }) {
  const active = isActiveLot(lot)
  const urgent = isUrgentLot(lot)

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-[0_10px_28px_rgba(22,32,48,0.08)] transition dark:bg-surface dark:shadow-none',
        !compact && 'h-full',
        urgent
          ? 'border-primary/40 shadow-[0_0_0_1px_rgba(0,0,0,0)] ring-1 ring-primary/20'
          : 'border-border',
      )}
    >
      {/* Media */}
      <Link
        href={`/lote/${lot.id}`}
        className={cn('relative block w-full overflow-hidden', compact ? 'aspect-[2/1]' : 'aspect-[16/9]')}
      >
        <Image
          src={lot.image || '/placeholder.svg'}
          alt={lot.title}
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 via-40% to-transparent dark:from-black/80 dark:via-black/25 dark:via-45%" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <FavoriteButton lotId={lot.id} />
          <StatusBadge status={lot.status} className="ml-auto" />
        </div>

      </Link>

      {lot.status === 'closed' && (
        <SoldStamp paddle={lot.soldToPaddle} size="sm" placement="end" />
      )}

      <div
        className={cn(
          'relative z-10 -mt-24 flex flex-col bg-[linear-gradient(to_bottom,transparent_0%,transparent_6.25rem,#ffffff_8.5rem)] dark:bg-[linear-gradient(to_bottom,transparent,var(--surface)_4.75rem)]',
          compact ? 'gap-2 px-3 pt-1 pb-3' : 'flex-1 gap-3 px-3.5 pt-2 pb-3.5',
        )}
      >
        <div className="-mt-5 mb-5 flex flex-col gap-1.5">
          <p className={cn(eyebrow, 'w-fit')}>
            <span className="inline-block rounded-full bg-black/40 px-2.5 py-1 text-white/90 backdrop-blur-sm dark:bg-transparent dark:px-0 dark:py-0 dark:text-white/75 dark:backdrop-blur-none">
              Lote {String(lot.order).padStart(2, '0')}
              {lot.color ? ` · ${lot.color}` : ''}
              {lot.seller ? ` · ${lot.seller}` : ''} ·{' '}
              {lot.headCount} {lot.headCount === 1 ? 'cabeza' : 'cabezas'}
            </span>
          </p>
          <h3 className={cn('line-clamp-2 font-display text-balance font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] dark:drop-shadow', compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl')}>
            {lot.title}
          </h3>
          {(lot.sire || lot.dam) && (
            <p className="flex gap-3 text-[11px] leading-4 text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] dark:text-white/80 dark:drop-shadow-none">
              {lot.sire ? (
                <span className="min-w-0 truncate">
                  <span className="text-white/60 dark:text-white/50">Padre </span>
                  {lot.sire}
                </span>
              ) : null}
              {lot.dam ? (
                <span className="min-w-0 truncate">
                  <span className="text-white/60 dark:text-white/50">Madre </span>
                  {lot.dam}
                </span>
              ) : null}
            </p>
          )}
        </div>
        <div className={cn('-mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#f3f5f7] dark:bg-background/40', compact ? 'p-2' : 'p-2.5')}>
          <Stat icon={Scale} label="Peso báscula" value={`${formatKg(lot.weightKg)} kg`} />
          <Stat icon={Tag} label="Precio / kg" value={`$${lot.pricePerKg.toFixed(2)}`} accent />
        </div>

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
                <span className={cn(eyebrow, 'block text-muted-foreground')}>Adjudicado</span>
                <span className="font-display text-lg font-bold tabular text-success">
                  ${formatUSD(displayedPrice(lot))}{' '}
                  <span className="text-xs font-semibold text-muted-foreground">USD</span>
                </span>
              </div>
              <div className="shrink-0 text-right">
                <span className={cn(eyebrow, 'block text-muted-foreground')}>Paleta</span>
                <span className="font-display text-lg font-bold tabular text-foreground">
                  #{lot.soldToPaddle ?? '—'}
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
                      index === 0 ? 'bg-success/10' : 'bg-[#f3f5f7] dark:bg-background/40',
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
              href={`/lote/${lot.id}`}
              className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              Ver resultado del lote
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {lot.status === 'upcoming' && (
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex min-h-36 flex-1 flex-col gap-2">
              <div className="flex items-end justify-between gap-3 rounded-2xl bg-[#f3f5f7] p-3 dark:bg-background/40">
                <div className="min-w-0">
                  <span className={cn(eyebrow, 'block text-muted-foreground')}>Valor referencial</span>
                  <span className="mt-1 block font-display text-lg font-bold tabular text-foreground">
                    ${formatUSD(Math.round(lot.weightKg * lot.pricePerKg))}
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">USD</span>
                  </span>
                </div>
                <p className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-2.5 py-1.5 font-display text-lg font-bold tabular text-primary ring-1 ring-primary/25">
                  <Heart className="h-4 w-4 fill-primary" />
                  {followerCount(lot)}
                </p>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2">
                <div className="flex h-full flex-col justify-end rounded-2xl bg-[#f3f5f7] p-3 dark:bg-background/40">
                  <span className={cn(eyebrow, 'flex items-center gap-1 text-muted-foreground')}>
                    <Clock className="h-3.5 w-3.5" />
                    Apertura
                  </span>
                  <span className="mt-1 block text-sm font-bold leading-snug text-foreground">
                    {lot.opensAtLabel ?? 'Por confirmar'}
                  </span>
                </div>
                <div className="flex h-full flex-col justify-end rounded-2xl bg-[#f3f5f7] p-3 dark:bg-background/40">
                  <span className={cn(eyebrow, 'text-muted-foreground')}>Cierre</span>
                  <span className="mt-1 block text-sm font-bold leading-snug text-foreground">
                    {lot.closesAtLabel ?? 'Por confirmar'}
                  </span>
                </div>
              </div>
            </div>
            <NotifyOpenButton />
          </div>
        )}
      </div>

      {urgent && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      )}
    </article>
  )
}
