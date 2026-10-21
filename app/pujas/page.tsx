'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Check, ChevronRight, Gavel, Heart, History } from 'lucide-react'
import { BuyerGuard } from '@/components/auth/buyer-guard'
import { useSession } from '@/components/auth/session-provider'
import { BidGate } from '@/components/auction/bid-gate'
import { Countdown } from '@/components/auction/countdown'
import { buyerBidSections, buyerLotBorderTone, type BuyerBidSections } from '@/lib/domain/buyer-bids'
import type { BuyerLot } from '@/lib/domain/buyer-lot'

import { formatLotBirthDate, isActiveLot, statusLabel } from '@/lib/domain/lot'
import { formatUSD } from '@/lib/format'
import { eyebrow, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { TopBar } from '@/components/layout/top-bar'
import { BackLink } from '@/components/layout/back-link'

type SectionKey = keyof BuyerBidSections

const sectionInfo: Record<SectionKey, { title: string; empty: string; icon: typeof Gavel; tone: string }> = {
  active: {
    title: 'Pujas activas',
    empty: 'Cuando pujes por un lote abierto, aparecerá aquí.',
    icon: Gavel,
    tone: 'text-primary',
  },
  following: {
    title: 'En seguimiento',
    empty: 'Guarda como favorito los lotes que quieras seguir.',
    icon: Heart,
    tone: 'text-warning dark:text-amber-500',
  },
  won: {
    title: 'Ganados',
    empty: 'Los lotes que ganes aparecerán aquí.',
    icon: Check,
    tone: 'text-success dark:text-emerald-500',
  },
  finished: {
    title: 'Perdidos',
    empty: 'Los lotes cerrados en los que participaste aparecerán aquí.',
    icon: History,
    tone: 'text-muted-foreground',
  },
}

function PujasContent() {
  const { state, client, favoriteLotIds, buyerLots, auctionId } = useSession()
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)

  if (!state || !client) {
    return (
      <>
        <TopBar title="Pujas" subtitle="Tu actividad en el remate" backHref="/" />
        <div className="px-4 py-6 lg:mx-auto lg:max-w-7xl lg:px-6"><div className="mb-3 hidden lg:block"><BackLink href="/" /></div><p className="text-sm text-muted-foreground">No encontramos un cliente asociado a esta cuenta.</p></div>
      </>
    )
  }

  const sections = buyerBidSections(buyerLots, auctionId ? [auctionId] : [], favoriteLotIds)
  const priorityLots = [...sections.active, ...sections.following, ...sections.won, ...sections.finished]
  const rawSelectedLot = priorityLots.find((lot) => lot.id === selectedLotId) ?? priorityLots[0] ?? null
  const selectedLot = rawSelectedLot ? buyerLots.find((lot) => lot.id === rawSelectedLot.id) ?? rawSelectedLot : null
  const selectedSection = selectedLot
    ? (Object.keys(sections) as SectionKey[]).find((key) => sections[key].some((lot) => lot.id === selectedLot.id)) ?? null
    : null

  return (
    <>
      <TopBar title="Pujas" subtitle="Tu actividad en el remate" backHref="/" />
      <main className="flex flex-col gap-5 px-4 py-4 lg:mx-auto lg:max-w-7xl lg:px-6 lg:py-6">
        <div className="hidden lg:block"><BackLink href="/" /></div>
        <header>
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Mis pujas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sigue tus pujas, los lotes guardados y tus resultados.</p>
        </header>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-5">
            {(Object.keys(sections) as SectionKey[]).map((key) => (
              <BidSection
                key={key}
                sectionKey={key}
                lots={sections[key]}

                selectedLotId={selectedLot?.id ?? null}
                onSelect={setSelectedLotId}
              />
            ))}
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block">
            {selectedLot ? (
              <SelectedLotPanel lot={selectedLot} sectionKey={selectedSection ?? 'active'} />
            ) : (
              <section className={cn(panel, 'flex min-h-72 flex-col items-center justify-center p-6 text-center')}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive-soft text-destructive dark:bg-primary/10 dark:text-primary"><Gavel className="h-5 w-5" /></span>
                <h2 className="mt-4 font-display text-lg font-bold text-foreground">Tu actividad aparecerá aquí</h2>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">Al pujar o guardar un lote asociado, podrás consultar sus detalles desde esta página.</p>
              </section>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}

function BidSection({
  sectionKey,
  lots,
  selectedLotId,
  onSelect,
}: {
  sectionKey: SectionKey
  lots: BuyerLot[]
  selectedLotId: string | null
  onSelect: (lotId: string) => void
}) {
  const info = sectionInfo[sectionKey]
  const Icon = info.icon

  return (
    <section className={cn(panel, 'overflow-hidden')}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-foreground sm:text-lg">
          <Icon className={cn('h-4 w-4', info.tone)} />
          {info.title}
        </h2>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold tabular text-muted-foreground">{lots.length}</span>
      </header>

      {lots.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground sm:px-5">{info.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3 p-3 sm:gap-3.5 sm:p-4">
          {lots.map((lot) => (
            <li key={lot.id} className="min-w-0">
              <BidLotRow
                lot={lot}
                sectionKey={sectionKey}

                selected={selectedLotId === lot.id}
                onSelect={() => onSelect(lot.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function BidLotRow({
  lot,
  sectionKey,
  selected,
  onSelect,
}: {
  lot: BuyerLot
  sectionKey: SectionKey
  selected: boolean
  onSelect: () => void
}) {
  const borderTone = buyerLotBorderTone(lot)
  const borderClass = borderTone === 'green'
    ? 'border-emerald-500 dark:border-emerald-400'
    : borderTone === 'orange'
      ? 'border-orange-500 dark:border-orange-400'
      : borderTone === 'red'
        ? 'border-red-500 dark:border-red-400'
        : 'border-border'
  const badge = sectionKey === 'won'
    ? 'Ganado'
    : sectionKey === 'finished'
      ? 'Perdido'
      : sectionKey === 'active'
        ? borderTone === 'green'
          ? 'Vas ganando'
          : borderTone === 'orange'
            ? 'Vas perdiendo'
            : 'Por cerrar'
        : lot.status === 'upcoming' ? 'Sin abrir' : statusLabel(lot.status)
  const badgeClass = borderTone === 'green'
    ? 'bg-success-soft text-success dark:bg-emerald-500/10 dark:text-emerald-300'
    : borderTone === 'orange'
      ? 'bg-warning-soft text-warning dark:bg-orange-500/10 dark:text-orange-300'
      : borderTone === 'red'
        ? 'bg-destructive-soft text-destructive dark:bg-red-500/10 dark:text-red-300'
        : 'bg-surface-2 text-muted-foreground'
  const priceLabel = lot.status === 'closed' ? 'Precio final' : 'Precio actual'

  const content = (
    <>
      <Image
        width={72}
        height={72}
        src={lot.image || '/cattle/certificate-example.svg'}
        alt=""
        className="h-16 w-16 shrink-0 rounded-xl border border-border bg-surface-2 object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', badgeClass)}>
            {badge}
          </span>
          <span className={cn(eyebrow, 'text-muted-foreground')}>Lote {String(lot.order).padStart(2, '0')}</span>
        </span>
        <span className="mt-1 block truncate font-display text-sm font-bold text-foreground sm:text-base">Raza: {lot.breed}</span>
        <span className="block truncate text-sm font-semibold text-foreground">Color: {lot.color ?? '—'}</span>
        <span className="block truncate text-xs text-muted-foreground">Nacimiento: {formatLotBirthDate(lot.birthDate)} · {lot.weightKg.toLocaleString('es-CR')} kg</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{[lot.registeredName, lot.seller].filter(Boolean).join(' · ') || lot.category}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[10px] font-medium text-muted-foreground">{priceLabel}</span>
        <span className="mt-0.5 block tabular text-sm font-bold text-foreground">${formatUSD(lot.finalPrice ?? lot.currentBid)}</span>
      </span>
      <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
    </>
  )

  return (
    <>
      <Link
        href={`/lote/${lot.id}?returnTo=%2Fpujas`}
        className={cn('flex min-h-[5.75rem] items-center gap-3 rounded-2xl border-2 p-3 transition hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-4 lg:hidden', borderClass)}
      >
        {content}
      </Link>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'hidden min-h-[5.75rem] w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-4 lg:flex',
          borderClass,
          selected ? 'bg-primary/5' : 'hover:bg-accent/60',
        )}
      >
        {content}
      </button>
    </>
  )
}

function SelectedLotPanel({ lot, sectionKey }: { lot: BuyerLot; sectionKey: SectionKey }) {
  const auction = useSession().state?.auctions.find((item) => item.id === lot.auctionId)
  const canBidOnLot = isActiveLot(lot)
  const won = sectionKey === 'won'

  return (
    <section className={cn(panel, 'overflow-hidden')}>
      <div className="p-4">
        <div className="relative overflow-hidden rounded-2xl bg-surface-2">
          <Image src={lot.image || '/cattle/certificate-example.svg'} width={640} height={480} alt={lot.breed} className="aspect-[4/3] w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground backdrop-blur">
            {sectionInfo[sectionKey].title}
          </span>
        </div>
        <p className={cn(eyebrow, 'mt-4 text-primary')}>{auction?.title ?? 'Subasta asociada'}</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">Lote {String(lot.order).padStart(2, '0')}</p>
        <h2 className="break-words font-display text-xl font-bold leading-tight text-foreground">Raza: {lot.breed}</h2>
        <p className="font-semibold text-foreground">Color: {lot.color ?? '—'}</p>
        <p className="text-sm text-muted-foreground">Nacimiento: {formatLotBirthDate(lot.birthDate)} · {lot.weightKg.toLocaleString('es-CR')} kg</p>
        <p className="text-sm text-muted-foreground">Padre: {lot.sire ?? '—'} · Madre: {lot.dam ?? '—'}</p>
        <p className="mt-1 text-sm text-muted-foreground">{lot.registeredName || lot.category}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-surface-2 p-3">
          <div>
            <span className={cn(eyebrow, 'text-muted-foreground')}>{lot.status === 'closed' ? 'Precio final' : 'Precio actual'}</span>
            <p className="mt-1 tabular font-display text-lg font-bold text-foreground">${formatUSD(lot.finalPrice ?? lot.currentBid)}</p>
          </div>
          <div>
            <span className={cn(eyebrow, 'text-muted-foreground')}>{canBidOnLot ? 'Tiempo restante' : 'Vendedor'}</span>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {canBidOnLot && lot.secondsLeft != null ? <Countdown seconds={lot.secondsLeft} /> : lot.seller || '—'}
            </p>
          </div>
        </div>

        {canBidOnLot ? (
          <div className="mt-4 rounded-2xl border border-border bg-background/40 p-3">
            <p className={cn(eyebrow, 'mb-2 text-muted-foreground')}>Puja mínima: ${formatUSD(lot.currentBid + lot.minIncrement)}</p>
            <BidGate lot={lot} size="lg" />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-border bg-background/40 p-3 text-sm text-muted-foreground">
            {won ? 'Ganado por ti.' : lot.status === 'closed' ? 'Vendido.' : lot.opensAtLabel ?? 'Este lote todavía no está abierto a pujas.'}
          </div>
        )}
      </div>
      <Link href={`/lote/${lot.id}?returnTo=%2Fpujas`} className="flex min-h-11 items-center justify-center gap-2 border-t border-border px-4 text-sm font-semibold text-primary transition hover:bg-accent">
        Ver detalle del lote
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export default function PujasPage() {
  return (
    <BuyerGuard next="/pujas">
      <PujasContent />
    </BuyerGuard>
  )
}
