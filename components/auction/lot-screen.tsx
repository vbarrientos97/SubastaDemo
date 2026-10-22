'use client'

import { safeInternalPath } from '@/lib/internal-path'
import { useEffect } from 'react'
import { currentAccount } from '@/lib/application/session'
import { canViewLot } from '@/lib/domain/auction'
import { cn } from '@/lib/utils'
import { eyebrow } from '@/lib/styles'
import { TopBar } from '@/components/layout/top-bar'
import { LotDetailMedia, LotDetailHeading } from '@/components/auction/lot-detail-header'
import { LotBidPanel, LotBidHistory } from '@/components/auction/lot-bidding'
import { LotDetailFacts } from '@/components/auction/lot-detail-facts'
import { PublicLotDetails } from '@/components/auction/public-lot-details'
import { useSession } from '@/components/auth/session-provider'
import { useRouter, useSearchParams } from 'next/navigation'
import { BackLink } from '@/components/layout/back-link'

export function LotScreen({ id }: { id: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { ready, state, buyerLots, auctionId } = useSession()
  const account = state ? currentAccount(state) : null
  const lot = (account?.role === 'admin' ? state?.lots : buyerLots)?.find((item) => item.id === id)
  const auction = state?.auctions.find((item) => item.id === lot?.auctionId) ?? null
  const requestedReturn = searchParams.get('returnTo')
  const safeReturn = requestedReturn ? safeInternalPath(requestedReturn) : null
  const buyerReturn = safeReturn && auctionId && (safeReturn === `/subasta/${auctionId}` || safeReturn.startsWith(`/subasta/${auctionId}?`) || ['/favoritos', '/pujas', '/notificaciones'].includes(safeReturn))
    ? safeReturn
    : auctionId ? `/subasta/${auctionId}` : '/'
  const backHref = account?.role === 'admin'
    ? `/admin/subastas/${auction?.id ?? ''}/lotes`
    : account?.role === 'buyer' ? buyerReturn : safeReturn ?? (auction ? `/subasta/${auction.id}` : '/')
  const wrongBuyerLot = account?.role === 'buyer' && !!auctionId && (!lot || lot.auctionId !== auctionId)

  useEffect(() => {
    if (ready && wrongBuyerLot) router.replace(auctionId ? `/subasta/${auctionId}` : '/')
  }, [ready, wrongBuyerLot, auctionId, router])

  if (!ready || !state) {
    const loadingReturn = safeReturn ?? '/'
    return <><TopBar title="Cargando lote" backHref={loadingReturn} backHistory={!!safeReturn} /><div className="px-4 py-6"><div className="mb-3 hidden lg:block"><BackLink href={loadingReturn} historyBack={!!safeReturn} /></div><p className="text-sm text-muted-foreground">Cargando…</p></div></>
  }

  if (wrongBuyerLot) return <p className="px-4 py-6 text-sm text-muted-foreground">Abriendo tu subasta…</p>

  const hidden =
    !lot ||
    !auction ||
    (account?.role !== 'admin' && !canViewLot(auction, lot, !!account))

  if (hidden) {
    return (
      <main className="px-4 py-10">
        <TopBar title="Detalle del lote" backHref={backHref} backHistory={!!safeReturn} />
        <p className="text-sm text-muted-foreground">Este lote no está en la subasta.</p>
        <div className="mt-3"><BackLink href={backHref} historyBack={!!safeReturn}>Volver al catálogo</BackLink></div>
      </main>
    )
  }

  if (!account) return <PublicLotDetails lot={lot} backHref={backHref} historyBack={!!safeReturn} />

  return (
    <>
      <TopBar title={`Lote ${String(lot.order).padStart(2, '0')}`} backHref={backHref} backHistory={!!safeReturn} />

      <div className="lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-10 lg:px-6 lg:py-8">
        <div className="lg:col-start-1">
          <div className="mb-4 hidden lg:block"><BackLink href={backHref} historyBack={!!safeReturn} /></div>
          <LotDetailMedia lot={lot} auctionOpen={auction?.status === 'abierta'} soldPaddle={account?.role === 'admin' && lot.status === 'closed' && 'soldToPaddle' in lot ? lot.soldToPaddle : undefined} />
          <LotDetailHeading lot={lot} />
        </div>

        <LotBidPanel lot={lot} />

        <main className="flex flex-col gap-5 px-4 py-5 lg:col-start-1 lg:px-0 lg:py-0">
          <LotDetailFacts lot={lot} />
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

          <LotBidHistory lot={lot} />
        </main>
      </div>
    </>
  )
}
