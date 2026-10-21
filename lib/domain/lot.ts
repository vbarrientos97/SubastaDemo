import { youtubeId } from '@/lib/youtube'

export type LotStatus = 'extended' | 'live' | 'imminent' | 'closed' | 'upcoming'
export type LotCategory = 'macho' | 'hembra'
export type SexFilter = 'todos' | LotCategory

export const LOT_COLORS = [
  'Negro', 'Colorado', 'Rojo', 'Blanco', 'Pinto', 'Pinto negro', 'Pinto colorado',
  'Barroso', 'Gris', 'Café', 'Amarillo', 'Overo', 'Berrendo', 'Cebrado',
] as const
export type LotColor = (typeof LOT_COLORS)[number]

// Mantener los colores demo limitados a este catálogo. En producción, validar el catálogo y
// aplicar cualquier regla de visibilidad de lotes en el servidor, no solo en el frontend.
export function normalizeLotColor(value: unknown): LotColor | undefined {
  if (typeof value !== 'string') return undefined
  return LOT_COLORS.find((color) => color.toLocaleLowerCase('es').trim() === value.toLocaleLowerCase('es').trim())
}

export function formatLotBirthDate(value?: string) {
  if (!value) return '—'
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (parts) return `${parts[3]}/${parts[2]}/${parts[1]}`
  const legacyParts = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return legacyParts ? value : '—'
}

export function lotBirthDateInputValue(value?: string) {
  if (!value) return ''
  const parts = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : value
}

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
  birthDate?: string
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
  color?: LotColor
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
  color?: LotColor | 'todos'
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
    const matchesColor = !query.color || query.color === 'todos' || lot.color === query.color
    const matchesText =
      !text ||
      lot.title.toLowerCase().includes(text) ||
      lot.registeredName.toLowerCase().includes(text) ||
      lot.breed.toLowerCase().includes(text) ||
      (lot.color?.toLowerCase().includes(text) ?? false)
    const price = displayedPrice(lot)
    const matchesPrice =
      (query.min == null || price >= query.min) && (query.max == null || price <= query.max)
    return matchesSex && matchesColor && matchesText && matchesPrice
  })
}

export function countByCategory(lots: Lot[]) {
  return {
    todos: lots.length,
    macho: lots.filter((lot) => lot.category === 'macho').length,
    hembra: lots.filter((lot) => lot.category === 'hembra').length,
  }
}

export type LotSort = 'orden' | 'precio-asc' | 'precio-desc'

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
  birthDate?: string
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
  if (!input.color) return 'Elige el color.'
  if (!normalizeLotColor(input.color)) return 'Elige un color válido.'
  if (!Number.isFinite(input.price) || input.price < 0) return 'El precio no es válido.'
  if (input.youtubeUrl.trim() && !youtubeId(input.youtubeUrl)) {
    return 'El enlace de YouTube no es válido.'
  }
  return null
}

export function validateBidAmount(lot: Pick<Lot, 'currentBid' | 'minIncrement'>, amount: number) {
  const minimum = lot.currentBid + lot.minIncrement
  if (!Number.isSafeInteger(amount) || !Number.isSafeInteger(minimum) ||
      lot.minIncrement <= 0 || amount < minimum) {
    return 'La puja debe alcanzar la oferta actual más el incremento mínimo.'
  }
  return null
}
