import type { Lot } from '@/lib/domain/lot'
import { isCatalogLot } from '@/lib/domain/lot'

export function isFavorite(ids: string[], lotId: string) {
  return ids.includes(lotId)
}

export function toggleFavoriteId(ids: string[], lotId: string) {
  return isFavorite(ids, lotId) ? ids.filter((id) => id !== lotId) : [...ids, lotId]
}

export function addFavoriteId(ids: string[], lotId: string) {
  return isFavorite(ids, lotId) ? ids : [...ids, lotId]
}

export function favoriteLots(lots: Lot[], ids: string[]) {
  const catalog = lots.filter(isCatalogLot)
  const byId = new Map(catalog.map((lot) => [lot.id, lot]))
  return ids.map((id) => byId.get(id)).filter((lot): lot is Lot => lot != null)
}

export function pruneFavoriteIds(ids: string[], lots: Lot[]) {
  const alive = new Set(lots.map((lot) => lot.id))
  return ids.filter((id) => alive.has(id))
}
