'use client'

import { visibleAuctions } from '@/lib/domain/auction'
import { useSession } from '@/components/auth/session-provider'
import { AuctionList } from '@/components/auction/auction-list'
import { TopBar } from '@/components/layout/top-bar'

export default function HomePage() {
  const { ready, state, user, client } = useSession()

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
  const buyerAuctions = isBuyer && client
    ? state.auctions.filter((auction) => auction.clientIds.includes(client.id))
    : []
  const openAuctions = buyerAuctions.filter((auction) => auction.status === 'abierta')
  const upcomingAuctions = isBuyer
    ? buyerAuctions.filter((auction) => auction.status === 'publicada')
    : visibleAuctions(state.auctions, !!user).filter((auction) => auction.status === 'publicada')
  const visitorAuctions = isVisitor
    ? visibleAuctions(state.auctions, false).filter((auction) =>
        auction.status === 'publicada' || auction.status === 'abierta',
      )
    : []

  return (
    <>
      <TopBar title="Subastas" subtitle={isBuyer ? 'Subastas asociadas' : user ? 'Catálogos publicados' : undefined} />
      <main className="flex flex-col gap-4 px-4 py-4 lg:mx-auto lg:max-w-3xl lg:px-6 lg:py-6">
        {isVisitor ? (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Subastas</h2>
            <AuctionList auctions={visitorAuctions} emptyMessage="No hay subastas disponibles ahora." />
          </section>
        ) : isBuyer ? (
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Subasta abierta</h2>
            </div>
            <AuctionList auctions={openAuctions} emptyMessage="No tienes una subasta abierta ahora." />
          </section>
        ) : null}
        {!isVisitor ? (
          <section className={`flex flex-col gap-4 ${isBuyer ? 'border-t border-border pt-5' : ''}`}>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Próximas subastas</h2>
            </div>
            <AuctionList
              auctions={upcomingAuctions}
              emptyMessage={isBuyer ? 'No tienes próximas subastas asociadas.' : undefined}
            />
          </section>
        ) : null}
      </main>
    </>
  )
}
