import Link from 'next/link'
import { Eye, Timer } from 'lucide-react'
import { categoryLabel, isActiveLot, isUrgentLot, type Lot } from '@/lib/domain/lot'
import type { BuyerLot } from '@/lib/domain/buyer-lot'
import { LiveGallery } from '@/components/auction/live-gallery'
import { Countdown } from '@/components/auction/countdown'
import { FavoriteButton } from '@/components/auction/favorite-button'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function LotDetailMedia({ lot, auctionOpen, soldPaddle }: { lot: Lot | BuyerLot; auctionOpen: boolean; soldPaddle?: number }) {
  const active = isActiveLot(lot)
  const urgent = isUrgentLot(lot)
  return (
    <>
      <div className="flex items-center gap-3 px-4 pt-4 lg:px-0 lg:pt-0">
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-primary-foreground" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-foreground" />
            </span>
            En vivo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {lot.status === 'closed' ? 'Lote cerrado' : 'Sin abrir'}
          </span>
        )}
        {auctionOpen ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Eye className="h-4 w-4" />
            512 viendo
          </span>
        ) : null}
      </div>

      <div className="mt-6 px-4 lg:px-0">
        <div className="overflow-hidden rounded-2xl">
          <LiveGallery
            image={lot.image}
            images={lot.images}
            title={lot.title}
            youtubeUrl={lot.youtubeUrl}
            soldPaddle={soldPaddle}
          />

          {active && lot.secondsLeft != null && (
            <div
              className={cn(
                'flex items-center justify-between gap-3 px-4 py-3',
                urgent ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-foreground',
              )}
            >
              <div className="flex items-center gap-2.5">
                <Timer className="h-6 w-6 shrink-0" />
                <div className="leading-tight">
                  <p className="text-sm font-bold uppercase tracking-wide">
                    {urgent ? '¡Tiempo extendido!' : 'Cierre del lote'}
                  </p>
                  <p className={cn('text-xs', urgent ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    {urgent ? '+30s añadidos por última puja' : 'Puja antes del cierre'}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  'rounded-xl px-3 py-1.5 font-display text-xl font-bold tabular sm:text-2xl',
                  urgent ? 'bg-black/25' : 'bg-warning/15 text-warning',
                )}
              >
                <Countdown seconds={lot.secondsLeft} />
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  )
}

export function LotDetailHeading({ lot }: { lot: Lot | BuyerLot }) {
  const category = categoryLabel(lot.category, true)
  return (
    <div className="flex flex-col gap-5 px-4 py-5 lg:px-0 lg:pt-5">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <nav className={cn(eyebrow, 'flex items-center gap-1.5 text-muted-foreground')}>
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <span aria-hidden>/</span>
            <span>{category}</span>
            <span aria-hidden>/</span>
            <span className="text-foreground">Lote {String(lot.order).padStart(2, '0')}</span>
          </nav>
          <FavoriteButton lotId={lot.id} label />
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl">
            Lote {String(lot.order).padStart(2, '0')}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-primary sm:text-lg">{lot.registeredName}</span>
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {lot.breed} · {category}
            </span>
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {lot.headCount} {lot.headCount === 1 ? 'cabeza' : 'cabezas'}
            </span>
          </div>
          {lot.seller ? <p className="mt-2 text-sm text-muted-foreground">Vendedor: {lot.seller}</p> : null}
        </div>
      </section>
    </div>
  )
}
