'use client'

import Link from 'next/link'
import { Compass, Flame, Heart } from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { useSession } from '@/components/auth/session-provider'
import { AuctionFloor } from '@/components/auction/auction-floor'
import { LotCard } from '@/components/auction/lot-card'
import { LotMobileList } from '@/components/auction/lot-mini-list'
import { FavoritesViewToggle } from '@/components/favorites/view-toggle'
import { TopBar } from '@/components/layout/top-bar'
import { useFavoritesView } from '@/hooks/use-favorites-view'
import type { FavoritesView } from '@/lib/favorites-view'
import { cn } from '@/lib/utils'

function FavoritesHeading({
  count,
  view,
  onView,
  className,
}: {
  count: number
  view: FavoritesView
  onView: (view: FavoritesView) => void
  className?: string
}) {
  return (
    <div className={cn(className, 'flex flex-wrap items-center justify-between gap-3')}>
      <div>
        <h2 className="font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
          Mis Lotes Favoritos
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-primary" />
          Sigue tus pujas en tiempo real
        </p>
      </div>
      <div className="flex items-center gap-2">
        <FavoritesViewToggle value={view} onChange={onView} />
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold text-foreground">
          <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
          {count} Lotes
        </span>
      </div>
    </div>
  )
}

function FavoritosContent() {
  const { favoriteLots: favorites } = useSession()
  const { view, setView } = useFavoritesView()

  return (
    <>
      <TopBar title="Mis Favoritos" subtitle="Sigue tus lotes" />

      <main className="flex flex-col gap-5 px-4 py-4 lg:mx-auto lg:max-w-7xl lg:px-6 lg:py-6">
        <FavoritesHeading count={favorites.length} view={view} onView={setView} />

        {favorites.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Aún no tienes favoritos. Marca el corazón en un lote para guardarlo aquí.
          </p>
        ) : view === 'columns' ? (
          <div className="hidden lg:block">
            <AuctionFloor lots={favorites} />
          </div>
        ) : null}

        {favorites.length > 0 ? (
          <div className="lg:hidden">
            <LotMobileList lots={favorites} />
          </div>
        ) : null}

        {favorites.length > 0 && view === 'grid' ? (
          <div className="hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3">
            {favorites.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>
        ) : null}

        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/50 px-4 py-4 text-sm font-semibold text-foreground transition hover:bg-surface"
        >
          <Compass className="h-4 w-4 text-primary" />
          Explorar más lotes en subasta
        </Link>
      </main>
    </>
  )
}

export default function FavoritosClient() {
  return (
    <RequireAuth next="/favoritos">
      <FavoritosContent />
    </RequireAuth>
  )
}
