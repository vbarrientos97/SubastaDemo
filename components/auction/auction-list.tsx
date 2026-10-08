import Link from 'next/link'
import { auctionStatusBadgeColor, auctionStatusLabel, type Auction } from '@/lib/domain/auction'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function AuctionList({
  auctions,
  emptyMessage = 'No hay subastas para mostrar.',
}: {
  auctions: Auction[]
  emptyMessage?: string
}) {
  if (auctions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {auctions.map((auction) => (
        <li key={auction.id}>
          <Link
            href={`/subasta/${auction.id}${auction.status === 'publicada' ? '?tab=proxima' : ''}`}
            className={cn(panel, 'block p-4 transition hover:bg-accent')}
          >
            <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', auctionStatusBadgeColor(auction.status))}>
              {auctionStatusLabel(auction.status)}
            </span>
            <h2 className="mt-2 font-display text-lg font-bold text-foreground sm:text-xl">{auction.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {[auction.seller, auction.location, auction.dates].filter(Boolean).join(' · ') || 'Sin fecha'}
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">{auction.totalLots} lotes</p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
