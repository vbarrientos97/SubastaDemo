import { youtubeId } from '@/lib/youtube'

export type LotStatus = 'extended' | 'live' | 'imminent' | 'closed' | 'upcoming'
export type LotCategory = 'macho' | 'hembra'
export type SexFilter = 'todos' | LotCategory

export type Bid = {
  bidder: string
  /** Stable buyer identity for bids created after this field was introduced. */
  bidderClientId?: string
  amount: number
  date: string
  time: string
}

export type Lot = {
  id: string
  order: number
  title: string
  registeredName: string
  category: LotCategory
  status: LotStatus
  image: string
  headCount: number
  weightKg: number
  pricePerKg: number
  currentBid: number
  minIncrement: number
  /** Remaining time in seconds. null for closed. */
  secondsLeft: number | null
  leader?: string
  /** Stable buyer identity for the current leader when known. */
  leaderClientId?: string
  sire?: string
  dam?: string
  breed: string
  /** Subasta dueña del lote. */
  auctionId: string
  seller?: string
  color?: string
  /** Hasta cuatro fotos. `image` sigue siendo la portada. */
  images?: string[]
  youtubeUrl?: string
  /** For closed lots */
  finalPrice?: number
  soldToPaddle?: number
  /** Buyer who won the lot. The board color comes from this client. */
  winnerClientId?: string
  /** Historical board sales stay out of the public floor. */
  inCatalog?: boolean
  /** For upcoming lots */
  opensAtLabel?: string
  closesAtLabel?: string
  bids?: Bid[]
}

export type LotQuery = {
  text: string
  sex: SexFilter
  min: number | null
  max: number | null
}

export function displayedPrice(lot: Lot) {
  return lot.finalPrice ?? lot.currentBid
}

export function isCatalogLot(lot: Lot) {
  return lot.inCatalog !== false
}

export function catalogLots(lots: Lot[]) {
  return lots.filter(isCatalogLot)
}

export function isActiveLot(lot: Lot) {
  return lot.status === 'extended' || lot.status === 'live' || lot.status === 'imminent'
}

export function isUrgentLot(lot: Lot) {
  return lot.status === 'extended' || lot.status === 'imminent'
}

/** Demo interest for lots that have not opened yet. Stable per lote. */
export function followerCount(lot: Lot) {
  return 6 + (lot.order % 5) * 2
}

export function competingBidders(lot: Lot) {
  const names = new Set((lot.bids ?? []).map((bid) => bid.bidder))
  return names.size
}

export function statusLabel(status: LotStatus) {
  if (status === 'extended') return 'En pista'
  if (status === 'live') return 'En vivo'
  if (status === 'imminent') return 'Por cerrar'
  if (status === 'closed') return 'Adjudicado'
  return 'Próximo'
}

export function categoryLabel(category: LotCategory, plural = false) {
  if (category === 'macho') return plural ? 'Machos' : 'Macho'
  return plural ? 'Hembras' : 'Hembra'
}

export function parseAmount(value: string) {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10)
  return Number.isFinite(parsed) ? parsed : null
}

export function filterLots(lots: Lot[], query: LotQuery) {
  const text = query.text.trim().toLowerCase()
  return lots.filter((lot) => {
    const matchesSex = query.sex === 'todos' || lot.category === query.sex
    const matchesText =
      !text ||
      lot.title.toLowerCase().includes(text) ||
      lot.registeredName.toLowerCase().includes(text) ||
      lot.breed.toLowerCase().includes(text)
    const price = displayedPrice(lot)
    const matchesPrice =
      (query.min == null || price >= query.min) && (query.max == null || price <= query.max)
    return matchesSex && matchesText && matchesPrice
  })
}

export function countByCategory(lots: Lot[]) {
  return {
    todos: lots.length,
    macho: lots.filter((lot) => lot.category === 'macho').length,
    hembra: lots.filter((lot) => lot.category === 'hembra').length,
  }
}

export type CatalogTab = 'abierta' | 'proxima'
export type LotSort = 'orden' | 'precio-asc' | 'precio-desc'

export function lotsForTab(lots: Lot[], tab: CatalogTab) {
  if (tab === 'proxima') {
    return lots.filter((lot) => lot.status === 'upcoming')
  }
  return lots.filter((lot) => lot.status !== 'upcoming')
}

export function sortLots(lots: Lot[], sort: LotSort) {
  const copy = lots.slice()
  if (sort === 'precio-asc') {
    return copy.sort((a, b) => displayedPrice(a) - displayedPrice(b))
  }
  if (sort === 'precio-desc') {
    return copy.sort((a, b) => displayedPrice(b) - displayedPrice(a))
  }
  return copy.sort((a, b) => a.order - b.order)
}

export function paginateLots<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(safePage, totalPages)
  const start = (current - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total: items.length,
  }
}

export function parseCatalogTab(value: string | null): CatalogTab {
  return value === 'proxima' ? 'proxima' : 'abierta'
}

export function parseLotSort(value: string | null): LotSort {
  if (value === 'precio-asc' || value === 'precio-desc') return value
  return 'orden'
}

export type LotInput = {
  title: string
  breed: string
  category: LotCategory
  price: number
  status: LotStatus
  seller: string
  color: string
  sire: string
  dam: string
  youtubeUrl: string
  images: string[]
}

export function lotImages(input: Pick<LotInput, 'images'>) {
  return input.images.map((item) => item.trim()).filter(Boolean).slice(0, 4)
}

export function validateLot(input: LotInput) {
  if (!input.title.trim()) return 'El lote necesita un nombre.'
  if (!input.breed.trim()) return 'Escribe la raza.'
  if (!Number.isFinite(input.price) || input.price < 0) return 'El precio no es válido.'
  if (input.youtubeUrl.trim() && !youtubeId(input.youtubeUrl)) {
    return 'El enlace de YouTube no es válido.'
  }
  return null
}
