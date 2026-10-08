'use client'

import { Suspense, use } from 'react'
import Link from 'next/link'
import { catalogLots } from '@/lib/domain/lot'
import { auctionStatusColor, auctionStatusLabel, canViewAuction, canViewLot, lotsOfAuction } from '@/lib/domain/auction'
import { useSession } from '@/components/auth/session-provider'
import { Catalog } from '@/components/auction/catalog'
import { TopBar } from '@/components/layout/top-bar'

export default function AuctionCatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { ready, state, user } = useSession()
  const auction = state?.auctions.find((item) => item.id === id) ?? null

  if (!ready || !state) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Cargando…</p>
  }

  const signedIn = !!user

  if (!auction || !canViewAuction(auction, signedIn)) {
    return (
      <main className="px-4 py-10">
        <p className="text-sm text-muted-foreground">Esta subasta no está disponible.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-primary">
          Volver a las subastas
        </Link>
      </main>
    )
  }

  const lots = catalogLots(lotsOfAuction(state.lots, auction.id)).filter((lot) =>
    canViewLot(auction, lot, signedIn),
  )
  const openAuctionId = state.auctions.find((item) => item.status === 'abierta')?.id
  const upcomingAuctionId =
    auction.status === 'publicada'
      ? auction.id
      : state.auctions.find((item) => item.status === 'publicada')?.id

  return (
    <>
      <TopBar title={auction.title} subtitle={auctionStatusLabel(auction.status)} backHref="/" />
      <main className="flex flex-col gap-4 px-4 py-4 lg:mx-auto lg:max-w-7xl lg:px-6 lg:py-6">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wide ${auctionStatusColor(auction.status)}`}>
            {auctionStatusLabel(auction.status)}
          </p>
          <h1 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">{auction.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[auction.seller, auction.location, auction.dates, auction.focus].filter(Boolean).join(' · ')}
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando catálogo…</p>}>
          <Catalog lots={lots} openAuctionId={openAuctionId} upcomingAuctionId={upcomingAuctionId} />
        </Suspense>
      </main>
    </>
  )
}
