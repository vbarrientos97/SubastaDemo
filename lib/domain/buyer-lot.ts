import type { Client } from '@/lib/domain/account'
import type { Lot } from '@/lib/domain/lot'
import { hasBidFromClient, isClientBid, isLeadingForClient, wasWonByClient } from '@/lib/domain/buyer-identity'

export type BuyerLot = Omit<Lot, 'winnerClientId' | 'soldToPaddle' | 'leaderClientId' | 'bids'> & {
  bids?: Omit<NonNullable<Lot['bids']>[number], 'bidderClientId'>[]
  hasOwnBid: boolean
  isOwnLeader: boolean
  buyerOutcome?: 'won' | 'sold'
}

function maskedBidder(value: string) {
  const letters = value.replace(/[^\p{L}]/gu, '')
  return `${letters.slice(0, 2).toLocaleLowerCase() || 'pu'}******`
}

/**
 * Public/buyer projection for mock lots. In production this privacy rule MUST
 * be enforced by the server before data reaches the client; frontend filtering
 * alone is not a security boundary.
 */
export function sanitizeLotForBuyer(lot: Lot, client: Client | null): BuyerLot {
  const wonByClient = lot.status === 'closed' && !!client && wasWonByClient(lot, client)
  const activity = {
    hasOwnBid: !!client && hasBidFromClient(lot, client),
    isOwnLeader: !!client && isLeadingForClient(lot, client),
  }

  if (lot.status === 'closed') {
    const { winnerClientId: _winnerClientId, soldToPaddle: _soldToPaddle, leader: _leader,
      leaderClientId: _leaderClientId, bids: _bids, ...safeLot } = lot
    return { ...safeLot, ...activity, buyerOutcome: wonByClient ? 'won' : 'sold' }
  }

  const safeBids = lot.bids?.map((bid) => {
    const isOwnBid = !!client && isClientBid(bid, client)
    const { bidderClientId: _bidderClientId, ...safeBid } = bid
    return { ...safeBid, bidder: isOwnBid ? 'Tú' : maskedBidder(bid.bidder) }
  })
  const { leaderClientId: _leaderClientId, winnerClientId: _winnerClientId, soldToPaddle: _soldToPaddle, ...safeLot } = lot
  return {
    ...safeLot,
    ...activity,
    leader: lot.leader ? (activity.isOwnLeader ? 'Tú' : maskedBidder(lot.leader)) : undefined,
    bids: safeBids,
  }
}

export function sanitizeLotsForBuyer(lots: Lot[], client: Client | null) {
  return lots.map((lot) => sanitizeLotForBuyer(lot, client))
}
