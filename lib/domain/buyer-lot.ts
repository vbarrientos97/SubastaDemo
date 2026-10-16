import type { Client } from '@/lib/domain/account'
import type { Lot } from '@/lib/domain/lot'

function maskedBidder(value: string) {
  const letters = value.replace(/[^\p{L}]/gu, '')
  return `${letters.slice(0, 2).toLocaleLowerCase() || 'pu'}******`
}

/**
 * Public/buyer projection for mock lots. In production this privacy rule MUST
 * be enforced by the server before data reaches the client; frontend filtering
 * alone is not a security boundary.
 */
export function sanitizeLotForBuyer(lot: Lot, client: Client | null): Lot {
  const wonByClient = lot.status === 'closed' && !!client && (
    lot.winnerClientId === client.id ||
    (!lot.winnerClientId && Number.parseInt(client.paddle.replace(/\D/g, ''), 10) === lot.soldToPaddle)
  )

  if (lot.status === 'closed') {
    const { winnerClientId: _winnerClientId, soldToPaddle: _soldToPaddle, leader: _leader,
      leaderClientId: _leaderClientId, bids: _bids, ...safeLot } = lot
    return { ...safeLot, buyerOutcome: wonByClient ? 'won' : 'sold' }
  }

  const safeBids = lot.bids?.map((bid) => {
    const isOwnBid = !!client && (bid.bidderClientId
      ? bid.bidderClientId === client.id
      : bid.bidder.trim().toLocaleLowerCase() === client.name.trim().toLocaleLowerCase())
    const { bidderClientId: _bidderClientId, ...safeBid } = bid
    return { ...safeBid, bidder: isOwnBid ? 'Tú' : maskedBidder(bid.bidder) }
  })
  const ownLeader = !!client && (lot.leaderClientId
    ? lot.leaderClientId === client.id
    : lot.leader?.trim().toLocaleLowerCase() === client.name.trim().toLocaleLowerCase())
  const { leaderClientId: _leaderClientId, ...safeLot } = lot
  return {
    ...safeLot,
    leader: lot.leader ? (ownLeader ? 'Tú' : maskedBidder(lot.leader)) : undefined,
    bids: safeBids,
  }
}

export function sanitizeLotsForBuyer(lots: Lot[], client: Client | null) {
  return lots.map((lot) => sanitizeLotForBuyer(lot, client))
}
