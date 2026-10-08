import { clientOfLot, regionOfLot, type Client } from '@/lib/domain/account'
import { displayedPrice, isActiveLot, type Lot, type LotCategory } from '@/lib/domain/lot'
import type { RegionId } from '@/lib/domain/region'

function highestClosed(lots: Lot[], category: LotCategory) {
  return lots.reduce<Lot | null>((best, lot) => {
    if (lot.status !== 'closed' || lot.category !== category) return best
    if (!best || displayedPrice(lot) > displayedPrice(best)) return lot
    return best
  }, null)
}

export function prizeLots(lots: Lot[]) {
  return {
    macho: highestClosed(lots, 'macho'),
    hembra: highestClosed(lots, 'hembra'),
  }
}

export function lotsByZone(lots: Lot[], clients: Client[]) {
  return lots
    .map((lot) => ({ lot, region: regionOfLot(lot, clients) }))
    .filter((item): item is { lot: Lot; region: NonNullable<typeof item.region> } => item.region != null)
    .reduce<{ id: string; name: string; lots: Lot[] }[]>((groups, item) => {
      const current = groups.find((group) => group.id === item.region.id)
      if (current) current.lots.push(item.lot)
      else groups.push({ id: item.region.id, name: item.region.name, lots: [item.lot] })
      return groups
    }, [])
}

const floorRank: Record<string, number> = { extended: 0, imminent: 1, live: 2 }

export type BoardQuery = {
  text: string
  regionId: RegionId | 'todos'
}

export function floorLot(lots: Lot[]) {
  return (
    lots
      .filter(isActiveLot)
      .sort(
        (a, b) =>
          (floorRank[a.status] ?? 9) - (floorRank[b.status] ?? 9) || a.order - b.order,
      )[0] ?? null
  )
}

export function closedSales(lots: Lot[]) {
  return lots.filter((lot) => lot.status === 'closed')
}

export function salesTotal(lots: Lot[]) {
  return closedSales(lots).reduce((sum, lot) => sum + displayedPrice(lot), 0)
}

export function remateProgress(lots: Lot[]) {
  const total = lots.length
  const closed = closedSales(lots).length
  const percent = total === 0 ? 0 : Math.round((closed / total) * 100)
  return { closed, total, percent }
}

export function boardLots(lots: Lot[], clients: Client[], query: BoardQuery) {
  const text = query.text.trim().toLowerCase()
  return lots
    .slice()
    .sort((a, b) => a.order - b.order)
    .filter((lot) => {
      const client = clientOfLot(lot, clients)
      const region = regionOfLot(lot, clients)
      const matchesRegion = query.regionId === 'todos' || region?.id === query.regionId
      const haystack = [String(lot.order), lot.title, lot.breed, client?.name ?? '']
        .join(' ')
        .toLowerCase()
      return matchesRegion && (!text || haystack.includes(text))
    })
}
