'use client'

import { Suspense, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { catalogLots } from '@/lib/domain/lot'
import { auctionStatusColor, auctionStatusLabel, canViewAuction, canViewLot, lotsOfAuction } from '@/lib/domain/auction'
import { useSession } from '@/components/auth/session-provider'
import { Catalog } from '@/components/auction/catalog'
import { TopBar } from '@/components/layout/top-bar'
import { BackLink } from '@/components/layout/back-link'

export default function AuctionCatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { ready, state, user, buyerLots, auctionId } = useSession()
  const router = useRouter()
  const auction = state?.auctions.find((item) => item.id === id) ?? null
  const isWrongBuyerAuction = user?.role === 'buyer' && id !== auctionId

  useEffect(() => {
    if (ready && isWrongBuyerAuction) router.replace(auctionId ? `/subasta/${auctionId}` : '/')
  }, [ready, isWrongBuyerAuction, auctionId, router])

  if (isWrongBuyerAuction) return <p className="px-4 py-6 text-sm text-muted-foreground">Abriendo tu subasta…</p>

  if (!ready || !state) {
    return (
      <>
        {user?.role === 'buyer' ? <TopBar title="Inicio" subtitle="Tu subasta" /> : <TopBar title="Subasta" backHref="/" />}
        <p className="px-4 py-6 text-sm text-muted-foreground">Cargando…</p>
      </>
    )
  }

  const signedIn = !!user

  if (!auction || !canViewAuction(auction, signedIn)) {
    return (
      <main className="px-4 py-10">
        <div className="mb-4"><TopBar title="Subasta" backHref="/" /></div>
        <p className="text-sm text-muted-foreground">Esta subasta no está disponible.</p>
        <div className="mt-3 hidden lg:block"><BackLink href="/">Volver a las subastas</BackLink></div>
      </main>
    )
  }

  const sourceLots = user?.role === 'admin' ? state.lots : buyerLots
  const lots = catalogLots(lotsOfAuction(sourceLots, auction.id)).filter((lot) =>
    canViewLot(auction, lot, signedIn),
  )
  return (
    <>
      {user?.role !== 'buyer' ? <TopBar
        title={auction.title}
        subtitle={auctionStatusLabel(auction.status)}
        backHref="/"
      /> : null}
      <main className="flex flex-col gap-4 px-4 py-4 lg:mx-auto lg:max-w-7xl lg:px-6 lg:py-6">
        {!user ? <div className="hidden lg:block"><BackLink href="/" /></div> : null}
        {user?.role === 'buyer' ? null : (
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${auctionStatusColor(auction.status)}`}>
              {auctionStatusLabel(auction.status)}
            </p>
            <h1 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">{auction.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[auction.seller, auction.location, auction.dates, auction.focus].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}
        <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando catálogo…</p>}>
          <Catalog lots={lots} publicView={!user} buyerView={user?.role === 'buyer'} />
        </Suspense>
      </main>
    </>
  )
}
