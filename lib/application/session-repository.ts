import type { Account, Client } from '@/lib/domain/account'
import type { Auction } from '@/lib/domain/auction'
import type { AuctionEvent } from '@/lib/domain/event'
import type { Lot } from '@/lib/domain/lot'

export type SessionState = {
  accounts: Account[]
  currentUserId: string | null
  currentAuctionId?: string | null
  auctions: Auction[]
  lots: Lot[]
  clients: Client[]
  /** Active account's projection; commands keep it in sync with favoritesByAccount. */
  favoriteLotIds: string[]
  favoritesByAccount?: Record<string, string[]>
  events: AuctionEvent[]
  pendingFavoriteLotId?: string | null
  schemaVersion?: number
}

export type SessionRepository = {
  load(): SessionState | null
  save(state: SessionState): void
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
