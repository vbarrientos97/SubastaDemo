'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { bidAccess, bidDenialMessage } from '@/lib/domain/auction'
import type { Lot } from '@/lib/domain/lot'
import { useSession } from '@/components/auth/session-provider'
import { BidBox } from '@/components/auction/bid-box'

export function BidGate({
  lot,
  size = 'md',
  interactive = true,
  promptLogin = false,
}: {
  lot: Lot
  size?: 'md' | 'lg'
  /** When false, an allowed buyer sees no box because the lot is not on the floor. */
  interactive?: boolean
  /** The catalog stays quiet. The login prompt lives on the lot page. */
  promptLogin?: boolean
}) {
  const pathname = usePathname()
  const { ready, user, client, state, placeBid } = useSession()
  const auction = state?.auctions.find((item) => item.id === lot.auctionId) ?? null
  if (!ready) return null
  const access = bidAccess(auction, user, client)
  if (access.ok) {
    if (!interactive) return null
    return (
      <BidBox
        currentBid={lot.currentBid}
        minIncrement={lot.minIncrement}
        size={size}
        onPlace={(amount) => placeBid(lot.id, amount)}
      />
    )
  }
  if (access.reason === 'login') {
    if (!promptLogin) return null
    return (
      <Link
        href={`/entrar?next=${encodeURIComponent(pathname)}`}
        className="block rounded-xl border border-border bg-surface-2 px-3 py-3 text-center text-sm font-semibold text-foreground"
      >
        {bidDenialMessage(access.reason)}
      </Link>
    )
  }
  return <p className="text-sm font-medium text-muted-foreground">{bidDenialMessage(access.reason)}</p>
}
