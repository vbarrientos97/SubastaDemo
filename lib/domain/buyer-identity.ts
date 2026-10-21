import type { Client } from '@/lib/domain/account'
import type { Bid, Lot } from '@/lib/domain/lot'

export function isClientBid(bid: Bid, client: Client) {
  return bid.bidderClientId
    ? bid.bidderClientId === client.id
    : bid.bidder.trim().toLocaleLowerCase() === client.name.trim().toLocaleLowerCase()
}

export function hasBidFromClient(lot: Lot, client: Client) {
  return (lot.bids ?? []).some((bid) => isClientBid(bid, client))
}

export function isLeadingForClient(lot: Lot, client: Client) {
  return lot.leaderClientId
    ? lot.leaderClientId === client.id
    : lot.leader?.trim().toLocaleLowerCase() === client.name.trim().toLocaleLowerCase()
}

export function wasWonByClient(lot: Lot, client: Client) {
  if (lot.winnerClientId) return lot.winnerClientId === client.id
  const paddle = Number.parseInt(client.paddle.replace(/\D/g, ''), 10)
  return Number.isFinite(paddle) && paddle === lot.soldToPaddle
}
