import type { StoredSession } from '@/lib/session/migrate'
import { isRegionId } from '@/lib/domain/region'
import { normalizeLotColor } from '@/lib/domain/lot'

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string')
const finite = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
const hasStrings = (value: Record<string, unknown>, keys: string[]) => keys.every((key) => typeof value[key] === 'string')
const optionalStrings = (value: Record<string, unknown>, keys: string[]) => keys.every((key) => value[key] == null || typeof value[key] === 'string')
const rows = (value: unknown, check: (row: Record<string, unknown>) => boolean) => Array.isArray(value) && value.every((row) => record(row) && check(row))

function validAccount(row: Record<string, unknown>) {
  return hasStrings(row, ['id', 'username', 'email', 'password']) &&
    ['admin', 'buyer'].includes(String(row.role)) && optionalStrings(row, ['clientId'])
}

function validAuction(row: Record<string, unknown>) {
  return hasStrings(row, ['id', 'title', 'location', 'dates', 'focus', 'closeLabel']) &&
    ['creada', 'incompleta', 'publicada', 'abierta', 'cerrada'].includes(String(row.status)) &&
    strings(row.clientIds) && finite(row.totalLots) && finite(row.connected) &&
    optionalStrings(row, ['startAt', 'endAt', 'closedAt', 'seller']) &&
    ['startAt', 'endAt', 'closedAt'].every((key) => !row[key] || (typeof row[key] === 'string' && Number.isFinite(Date.parse(row[key]))))
}

function validEvent(row: Record<string, unknown>) {
  return hasStrings(row, ['id', 'title', 'startsAt']) &&
    ['auction', 'raffle', 'other', 'live_remate'].includes(String(row.typeId)) &&
    optionalStrings(row, ['endsAt', 'description', 'href', 'lotId']) &&
    typeof row.startsAt === 'string' && Number.isFinite(Date.parse(row.startsAt)) &&
    (!row.endsAt || (typeof row.endsAt === 'string' && Number.isFinite(Date.parse(row.endsAt))))
}

function validLot(row: Record<string, unknown>, legacy: boolean) {
  return hasStrings(row, ['id', 'title', 'registeredName', 'breed', 'image']) &&
    optionalStrings(row, ['auctionId', 'color', 'birthDate', 'sire', 'dam', 'leader', 'leaderClientId', 'winnerClientId', 'youtubeUrl', 'seller', 'opensAtLabel', 'closesAtLabel']) &&
    (legacy || (typeof row.auctionId === 'string' && !!row.auctionId)) &&
    (row.inCatalog === undefined || typeof row.inCatalog === 'boolean') &&
    (legacy || row.color === undefined || (typeof row.color === 'string' && normalizeLotColor(row.color) === row.color)) &&
    ['live', 'extended', 'imminent', 'closed', 'upcoming'].includes(String(row.status)) &&
    ['macho', 'hembra'].includes(String(row.category)) &&
    ['order', 'currentBid', 'minIncrement', 'headCount', 'weightKg', 'pricePerKg'].every((key) => finite(row[key]) && Number(row[key]) >= 0) &&
    Number(row.minIncrement) > 0 &&
    (row.secondsLeft === null || (finite(row.secondsLeft) && Number(row.secondsLeft) >= 0)) &&
    ['finalPrice', 'soldToPaddle'].every((key) => row[key] == null || finite(row[key])) &&
    (row.images === undefined || strings(row.images)) &&
    (row.bids === undefined || rows(row.bids, (bid) => hasStrings(bid, ['bidder', 'date', 'time']) && finite(bid.amount) && optionalStrings(bid, ['bidderClientId'])))
}

/** Validate JSON fields used by the UI and migrations before trusting their types. */
export function isStoredSession(value: unknown): value is StoredSession {
  if (!record(value)) return false
  if (!optionalStrings(value, ['currentUserId', 'currentAuctionId', 'pendingFavoriteLotId'])) return false
  if (value.schemaVersion != null && (!Number.isSafeInteger(value.schemaVersion) || Number(value.schemaVersion) < 0)) return false
  if (!rows(value.accounts, validAccount)) return false
  if (!rows(value.clients, (row) => hasStrings(row, ['id', 'name', 'paddle', 'regionId']) && typeof row.regionId === 'string' && isRegionId(row.regionId))) return false
  if (Array.isArray(value.auctions)) {
    if (!rows(value.auctions, validAuction)) return false
  } else {
    const legacy = value.auction
    if (!record(legacy) || !optionalStrings(legacy, ['title', 'location', 'dates', 'focus', 'closeLabel']) || ['totalLots', 'connected'].some((key) => legacy[key] != null && !finite(legacy[key]))) return false
  }
  if (!rows(value.lots, (row) => validLot(row, Number(value.schemaVersion ?? 0) < 18))) return false
  if (value.favoriteLotIds !== undefined && !strings(value.favoriteLotIds)) return false
  if (value.favoritesByAccount !== undefined && (!record(value.favoritesByAccount) || !Object.values(value.favoritesByAccount).every(strings))) return false
  if (value.events !== undefined && !rows(value.events, validEvent)) return false
  return true
}
