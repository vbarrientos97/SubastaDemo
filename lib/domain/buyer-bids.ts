import type { BuyerLot } from '@/lib/domain/buyer-lot'
import { isActiveLot } from '@/lib/domain/lot'

export type BuyerBidSections = {
  active: BuyerLot[]
  following: BuyerLot[]
  won: BuyerLot[]
  finished: BuyerLot[]
}

export type BuyerLotBorderTone = 'neutral' | 'green' | 'orange' | 'red'

export function buyerLotBorderTone(lot: BuyerLot): BuyerLotBorderTone {
  if (lot.status === 'closed') return lot.buyerOutcome === 'won' ? 'green' : 'red'
  if (!isActiveLot(lot) || !lot.hasOwnBid) return 'neutral'
  if (lot.status === 'imminent' || (lot.secondsLeft != null && lot.secondsLeft <= 10)) return 'red'
  return lot.isOwnLeader ? 'green' : 'orange'
}

export function buyerBidSections(
  lots: BuyerLot[],
  associatedAuctionIds: string[],
  favoriteLotIds: string[],
): BuyerBidSections {
  const auctions = new Set(associatedAuctionIds)
  const favorites = new Set(favoriteLotIds)
  const associated = lots.filter((lot) => auctions.has(lot.auctionId))
  const byOrder = (a: BuyerLot, b: BuyerLot) => a.order - b.order
  return {
    active: associated.filter((lot) => lot.hasOwnBid && isActiveLot(lot)).sort(byOrder),
    following: associated.filter((lot) => favorites.has(lot.id) && !lot.hasOwnBid &&
      lot.buyerOutcome !== 'won' && (isActiveLot(lot) || lot.status === 'upcoming')).sort(byOrder),
    won: associated.filter((lot) => lot.status === 'closed' && lot.buyerOutcome === 'won').sort(byOrder),
    finished: associated.filter((lot) => lot.hasOwnBid && lot.status === 'closed' && lot.buyerOutcome !== 'won').sort(byOrder),
  }
}
