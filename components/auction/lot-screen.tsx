'use client'

import Link from 'next/link'
import { Eye, Timer, Gavel, Trophy } from 'lucide-react'
import { currentAccount } from '@/lib/application/session'
import { canViewLot } from '@/lib/domain/auction'
import { categoryLabel, displayedPrice, isActiveLot, isUrgentLot } from '@/lib/domain/lot'
import { formatUSD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { eyebrow, panel, panelSm } from '@/lib/styles'
import { TopBar } from '@/components/layout/top-bar'
import { LiveGallery } from '@/components/auction/live-gallery'
import { Countdown } from '@/components/auction/countdown'
import { BidGate } from '@/components/auction/bid-gate'
import { FavoriteButton } from '@/components/auction/favorite-button'
import { useSession } from '@/components/auth/session-provider'

export function LotScreen({ id }: { id: string }) {
  const { ready, state } = useSession()
  const lot = state?.lots.find((item) => item.id === id)
  const auction = state?.auctions.find((item) => item.id === lot?.auctionId) ?? null

  if (!ready || !state) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Cargando…</p>
  }

  const account = currentAccount(state)
  const hidden =
    !lot ||
    !auction ||
    (account?.role !== 'admin' && !canViewLot(auction, lot, !!account))

  if (hidden) {
    return (
      <main className="px-4 py-10">
        <p className="text-sm text-muted-foreground">Este lote no está en la subasta.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-primary">
          Volver al catálogo
        </Link>
      </main>
    )
  }

  const active = isActiveLot(lot)
  const urgent = isUrgentLot(lot)
  const category = categoryLabel(lot.category, true)

  return (
    <>
      <TopBar title="Ring en Vivo" backHref={`/subasta/${lot.auctionId}`} />

      <div className="lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-10 lg:px-6 lg:py-8">
      <div className="lg:col-start-1">
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
            {lot.status === 'closed' ? 'Lote cerrado' : 'Próximamente'}
          </span>
        )}
        {auction?.status === 'abierta' ? (
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
        soldPaddle={lot.status === 'closed' ? lot.soldToPaddle : undefined}
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
            {(lot.color || lot.seller) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {[lot.color, lot.seller].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </section>
      </div>
      </div>

      <aside className="px-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:px-0">
        {active ? (
          <section className={cn(panel, 'flex flex-col gap-2 p-4')}>
            <div className="flex items-baseline justify-between">
              <span className={cn(eyebrow, 'text-muted-foreground')}>
                Realiza tu puja
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Mín &gt; ${formatUSD(lot.currentBid)}
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
                Adjudicado · Paleta #{lot.soldToPaddle}
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

      <main className="flex flex-col gap-5 px-4 py-5 lg:col-start-1 lg:px-0 lg:py-0">
        {(lot.sire || lot.dam) && (
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-input bg-surface-2 p-4 dark:border-orange-900/50 dark:bg-orange-950/40">
              <span className={cn(eyebrow, 'text-muted-foreground dark:text-orange-200/80')}>
                Padre
              </span>
              <p className="mt-1 font-semibold text-foreground">{lot.sire}</p>
            </div>
            <div className="rounded-2xl border border-input bg-surface-2 p-4 dark:border-orange-900/50 dark:bg-orange-950/40">
              <span className={cn(eyebrow, 'text-muted-foreground dark:text-orange-200/80')}>
                Madre
              </span>
              <p className="mt-1 font-semibold text-foreground">{lot.dam}</p>
            </div>
          </section>
        )}

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
              {active ? 'Puja líder actual' : 'Puja ganadora'}
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
      </main>
      </div>
    </>
  )
}
