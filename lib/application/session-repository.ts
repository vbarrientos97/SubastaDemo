import type { Account, Client } from '@/lib/domain/account'
import { OPEN_AUCTION_ID, type Auction } from '@/lib/domain/auction'
import type { AuctionEvent } from '@/lib/domain/event'
import type { Lot } from '@/lib/domain/lot'

export type SessionState = {
  accounts: Account[]
  currentUserId: string | null
  auctions: Auction[]
  lots: Lot[]
  clients: Client[]
  favoriteLotIds: string[]
  events: AuctionEvent[]
  pendingFavoriteLotId?: string | null
  schemaVersion?: number
}

type LegacyAuction = {
  title?: string
  location?: string
  focus?: string
  closeLabel?: string
  dates?: string
  totalLots?: number
  connected?: number
}

export type StoredSession = Partial<SessionState> & {
  auction?: LegacyAuction
}

export type SessionRepository = {
  load(): SessionState | null
  save(state: SessionState): void
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }

export const SESSION_SCHEMA_VERSION = 12

export function migrateSessionState(raw: StoredSession): SessionState {
  const legacy = raw.auction
  const auctions =
    Array.isArray(raw.auctions) && raw.auctions.length > 0
      ? raw.auctions
      : [
          {
            id: OPEN_AUCTION_ID,
            status: 'abierta' as const,
            title: legacy?.title ?? '',
            location: legacy?.location ?? '',
            focus: legacy?.focus ?? '',
            closeLabel: legacy?.closeLabel ?? '',
            dates: legacy?.dates ?? '',
            totalLots: legacy?.totalLots ?? 0,
            connected: legacy?.connected ?? 0,
            clientIds: ['carlos-santiago'],
          },
        ]
  const lots = (raw.lots ?? []).map((lot) => ({
    ...lot,
    auctionId: lot.auctionId || OPEN_AUCTION_ID,
  }))
  return {
    accounts: raw.accounts ?? [],
    currentUserId: raw.currentUserId ?? null,
    auctions: auctions.map((auction) =>
      String(auction.status) === 'incompleta' ? { ...auction, status: 'creada' as const } : auction,
    ),
    lots,
    clients: raw.clients ?? [],
    favoriteLotIds: Array.isArray(raw.favoriteLotIds) ? raw.favoriteLotIds : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    pendingFavoriteLotId: raw.pendingFavoriteLotId ?? null,
    schemaVersion: SESSION_SCHEMA_VERSION,
  }
}
