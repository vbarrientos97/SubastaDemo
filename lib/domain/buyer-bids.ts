import type { Client } from '@/lib/domain/account'
import { isActiveLot, type Lot } from '@/lib/domain/lot'

function wasWonByClient(lot: Lot, client: Client) {
  if (lot.winnerClientId) return lot.winnerClientId === client.id
  const clientPaddle = Number.parseInt(client.paddle.replace(/\D/g, ''), 10)
  return Number.isFinite(clientPaddle) && clientPaddle === lot.soldToPaddle
}

export type BuyerBidSections = {
  active: Lot[]
  following: Lot[]
  won: Lot[]
  finished: Lot[]
}

export type BuyerLotBorderTone = 'neutral' | 'green' | 'orange' | 'red'

export function hasBidFromClient(lot: Lot, client: Client) {
  const normalizedName = client.name.trim().toLocaleLowerCase()
  return (lot.bids ?? []).some((bid) =>
    bid.bidderClientId
      ? bid.bidderClientId === client.id
      : bid.bidder.trim().toLocaleLowerCase() === normalizedName,
  )
}

export function isLeadingForClient(lot: Lot, client: Client) {
  if (lot.leaderClientId) return lot.leaderClientId === client.id
  return lot.leader?.trim().toLocaleLowerCase() === client.name.trim().toLocaleLowerCase()
}

export function buyerLotBorderTone(lot: Lot, client: Client): BuyerLotBorderTone {
  if (lot.status === 'closed') return wasWonByClient(lot, client) ? 'green' : 'red'
  if (!isActiveLot(lot) || !hasBidFromClient(lot, client)) return 'neutral'
  if (lot.status === 'imminent' || (lot.secondsLeft != null && lot.secondsLeft <= 10)) return 'red'
  return isLeadingForClient(lot, client) ? 'green' : 'orange'
}

export function buyerBidSections(
  lots: Lot[],
  client: Client,
  associatedAuctionIds: string[],
  favoriteLotIds: string[],
): BuyerBidSections {
  const auctions = new Set(associatedAuctionIds)
  const favorites = new Set(favoriteLotIds)
  const associatedLots = lots.filter((lot) => auctions.has(lot.auctionId))
  const ownBids = new Set(associatedLots.filter((lot) => hasBidFromClient(lot, client)).map((lot) => lot.id))
  const won = new Set(
    associatedLots
      .filter((lot) => lot.status === 'closed' && wasWonByClient(lot, client))
      .map((lot) => lot.id),
  )
  const byOrder = (left: Lot, right: Lot) => left.order - right.order

  return {
    active: associatedLots
      .filter((lot) => ownBids.has(lot.id) && isActiveLot(lot))
      .sort(byOrder),
    following: associatedLots
      .filter(
        (lot) =>
          favorites.has(lot.id) &&
          !ownBids.has(lot.id) &&
          !won.has(lot.id) &&
          (isActiveLot(lot) || lot.status === 'upcoming'),
      )
      .sort(byOrder),
    won: associatedLots.filter((lot) => won.has(lot.id)).sort(byOrder),
    finished: associatedLots
      .filter((lot) => ownBids.has(lot.id) && lot.status === 'closed' && !won.has(lot.id))
      .sort(byOrder),
  }
}
