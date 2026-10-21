import type { SessionState } from '@/lib/application/session-repository'
import { OPEN_AUCTION_ID, buyerHomeAuctionId } from '@/lib/domain/auction'
import { normalizeLotColor } from '@/lib/domain/lot'
import { demoLotBirthDate, demoLotColor } from '@/lib/session/demo-lot'

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

export const SESSION_SCHEMA_VERSION = 19

/** Repair references without restoring deleted demo records or rewriting commerce history. */
export function normalizeSessionReferences(state: SessionState): SessionState {
  const unique = <T extends { id: string }>(rows: T[]) => {
    const seen = new Set<string>()
    return rows.filter((row) => {
      if (seen.has(row.id)) return false
      seen.add(row.id)
      return true
    })
  }
  const clients = unique(state.clients)
  const clientIds = new Set(clients.map((row) => row.id))
  const accounts = unique(state.accounts).map((row) => row.clientId && !clientIds.has(row.clientId) ? { ...row, clientId: undefined } : row)
  const accountIds = new Set(accounts.map((row) => row.id))
  const auctions = unique(state.auctions).map((row) => ({ ...row, clientIds: [...new Set(row.clientIds.filter((id) => clientIds.has(id)))] }))
  const auctionIds = new Set(auctions.map((row) => row.id))
  const lots = unique(state.lots).filter((row) => auctionIds.has(row.auctionId))
  const lotIds = new Set(lots.map((row) => row.id))
  const favoritesByAccount = Object.fromEntries(Object.entries(state.favoritesByAccount ?? {})
    .filter(([id]) => accountIds.has(id)).map(([id, ids]) => [id, [...new Set(ids.filter((lotId) => lotIds.has(lotId)))]]))
  const currentUserId = state.currentUserId && accountIds.has(state.currentUserId) ? state.currentUserId : null
  return {
    ...state, accounts, clients, auctions, lots, currentUserId, favoritesByAccount,
    favoriteLotIds: currentUserId ? favoritesByAccount[currentUserId] ?? [] : [],
    currentAuctionId: state.currentAuctionId && auctionIds.has(state.currentAuctionId) ? state.currentAuctionId : null,
    pendingFavoriteLotId: state.pendingFavoriteLotId && lotIds.has(state.pendingFavoriteLotId) ? state.pendingFavoriteLotId : null,
    events: unique(state.events).map((row) => row.lotId && !lotIds.has(row.lotId) ? { ...row, lotId: undefined } : row),
  }
}

export function migrateSessionState(raw: StoredSession): SessionState {
  const legacy = raw.auction
  const auctions =
    Array.isArray(raw.auctions)
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
    color: (raw.schemaVersion ?? 0) < 18 ? normalizeLotColor(lot.color) ?? demoLotColor(lot.breed, lot.order) : lot.color,
    birthDate: (raw.schemaVersion ?? 0) < 18 ? lot.birthDate || demoLotBirthDate(lot.order) : lot.birthDate,
  }))
  const accounts = raw.accounts ?? []
  const currentUserId = raw.currentUserId ?? null
  const currentAccount = accounts.find((account) => account.id === currentUserId)
  const currentClientId = currentAccount?.clientId ?? null
  const currentAuctionId = raw.currentAuctionId && auctions.some((auction) => auction.id === raw.currentAuctionId)
    ? raw.currentAuctionId
    : currentAccount?.role === 'buyer'
      ? buyerHomeAuctionId(auctions, currentClientId)
      : null
  const favoritesByAccount = { ...raw.favoritesByAccount }
  if (!raw.favoritesByAccount && currentUserId) favoritesByAccount[currentUserId] = raw.favoriteLotIds ?? []
  return {
    accounts,
    currentUserId,
    currentAuctionId,
    auctions: auctions.map((auction) =>
      String(auction.status) === 'incompleta' ? { ...auction, status: 'creada' as const } : auction,
    ),
    lots,
    clients: raw.clients ?? [],
    favoriteLotIds: currentUserId ? favoritesByAccount[currentUserId] ?? [] : [],
    favoritesByAccount,
    events: Array.isArray(raw.events) ? raw.events : [],
    pendingFavoriteLotId: raw.pendingFavoriteLotId ?? null,
    schemaVersion: SESSION_SCHEMA_VERSION,
  }
}
