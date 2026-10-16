'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { visibleAuctions } from '@/lib/domain/auction'
import { buyerHomeAuctionId } from '@/lib/domain/auction'
import { useSession } from '@/components/auth/session-provider'
import { AuctionList } from '@/components/auction/auction-list'
import { TopBar } from '@/components/layout/top-bar'

export default function HomePage() {
  const { ready, state, user, client } = useSession()
  const router = useRouter()
  const homeAuctionId = state && user?.role === 'buyer'
    ? state.currentAuctionId ?? buyerHomeAuctionId(state.auctions, client?.id)
    : null

  useEffect(() => {
    if (ready && user?.role === 'buyer' && homeAuctionId) {
      router.replace(`/subasta/${homeAuctionId}`)
    }
  }, [ready, user?.role, homeAuctionId, router])

  if (!ready || !state) {
    return (
      <>
        <TopBar title="Subastas" subtitle="Catálogos publicados" />
        <p className="px-4 py-6 text-sm text-muted-foreground">Cargando…</p>
      </>
    )
  }

  const isBuyer = user?.role === 'buyer'
  const isVisitor = !user
  const visitorAuctions = isVisitor
    ? visibleAuctions(state.auctions, false).filter((auction) =>
        auction.status === 'publicada' || auction.status === 'abierta',
      )
    : []

  if (isBuyer) {
    return (
      <>
        <TopBar title="Inicio" subtitle="Tu subasta" />
        <p className="px-4 py-6 text-sm text-muted-foreground">
          {homeAuctionId ? 'Abriendo tu subasta…' : 'No hay una subasta disponible para esta cuenta.'}
        </p>
      </>
    )
  }

  return (
    <>
      <TopBar title="Subastas" subtitle={isBuyer ? 'Subastas asociadas' : user ? 'Catálogos publicados' : undefined} />
      <main className="flex flex-col gap-4 px-4 py-4 lg:mx-auto lg:max-w-3xl lg:px-6 lg:py-6">
        {isVisitor ? (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Subastas</h2>
            <AuctionList auctions={visitorAuctions} emptyMessage="No hay subastas disponibles ahora." />
          </section>
        ) : null}
        {user?.role === 'admin' ? (
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Próximas subastas</h2>
            </div>
            <AuctionList
              auctions={visibleAuctions(state.auctions, true).filter((auction) => auction.status === 'publicada')}
            />
          </section>
        ) : null}
      </main>
    </>
  )
}
