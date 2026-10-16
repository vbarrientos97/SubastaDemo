import type { Account, Client } from '@/lib/domain/account'
import type { Lot } from '@/lib/domain/lot'

export const OPEN_AUCTION_ID = 'subasta-carlos'

export type AuctionStatus = 'creada' | 'publicada' | 'abierta' | 'cerrada'

export type Auction = {
  id: string
  status: AuctionStatus
  title: string
  location: string
  seller?: string
  focus: string
  closeLabel: string
  dates: string
  startAt?: string
  endAt?: string
  closedAt?: string
  totalLots: number
  connected: number
  clientIds: string[]
}

export type AuctionInput = {
  title: string
  location: string
  seller?: string
  dates: string
  startAt?: string
  endAt?: string
  status: AuctionStatus
}

const statuses: AuctionStatus[] = ['creada', 'publicada', 'abierta', 'cerrada']

export function isAuctionStatus(value: string): value is AuctionStatus {
  return statuses.includes(value as AuctionStatus)
}

export function auctionStatusLabel(status: AuctionStatus) {
  if (status === 'creada') return 'Creada'
  if (status === 'publicada') return 'Publicada'
  if (status === 'abierta') return 'Abierta'
  return 'Cerrada'
}

export function auctionStatusColor(status: AuctionStatus) {
  if (status === 'abierta') return 'text-success dark:text-emerald-400'
  if (status === 'cerrada') return 'text-closed dark:text-red-400'
  if (status === 'publicada') return 'text-warning dark:text-orange-400'
  return 'text-muted-foreground'
}

export function auctionStatusBadgeColor(status: AuctionStatus) {
  if (status === 'abierta') return 'bg-success-soft text-success dark:bg-emerald-950/50 dark:text-emerald-300'
  if (status === 'cerrada') return 'bg-closed-soft text-closed dark:bg-red-950/50 dark:text-red-300'
  if (status === 'publicada') return 'bg-warning-soft text-warning dark:bg-orange-950/50 dark:text-orange-300'
  return 'bg-surface-2 text-muted-foreground'
}

export function auctionStatusActions(
  status: AuctionStatus,
): { status: AuctionStatus; label: string }[] {
  if (status === 'creada') {
    return [{ status: 'publicada' as const, label: 'Publicar' }]
  }
  return []
}

export function validateAuctionTransition(
  currentStatus: AuctionStatus | null,
  nextStatus: AuctionStatus,
) {
  if (nextStatus === 'abierta') return 'La subasta se abre automáticamente según la fecha de inicio.'
  if (nextStatus === 'cerrada' && currentStatus !== 'cerrada') return 'El cierre de la subasta es automático.'
  if (currentStatus === 'cerrada' && nextStatus !== 'cerrada') return 'Una subasta cerrada no se puede reabrir.'
  if (currentStatus && currentStatus !== 'creada' && nextStatus !== currentStatus) return 'Solo se pueden publicar subastas creadas.'
  return null
}

/** Deriva los estados publicados/abiertos/cerrados desde su ventana de fechas. */
export function auctionStatusAtTime(auction: Auction, now = new Date()): AuctionStatus {
  if (auction.status === 'cerrada') return 'cerrada'
  const startAt = auction.startAt ? new Date(auction.startAt).getTime() : Number.NaN
  const endAt = auction.endAt ? new Date(auction.endAt).getTime() : Number.NaN
  const nowAt = now.getTime()
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt)) return auction.status
  if (nowAt >= endAt) return 'cerrada'
  if (auction.status === 'creada') return 'creada'
  return nowAt >= startAt ? 'abierta' : 'publicada'
}

/** Devuelve la colección original si no hay cambios, facilitando evitar renders innecesarios. */
export function refreshAuctionStatuses(auctions: Auction[], now = new Date()): Auction[] {
  let changed = false
  const next = auctions.map((auction) => {
    const status = auctionStatusAtTime(auction, now)
    if (status === auction.status) return auction
    changed = true
    return {
      ...auction,
      status,
      closedAt: status === 'cerrada' ? auction.endAt ?? now.toISOString() : undefined,
    }
  })
  return changed ? next : auctions
}

export function isPublicAuction(auction: Auction) {
  return auction.status !== 'creada'
}

/** Sin sesión no se ven subastas cerradas ni sus lotes. */
export function canViewAuction(auction: Auction, signedIn: boolean) {
  if (!isPublicAuction(auction)) return false
  if (!signedIn && auction.status === 'cerrada') return false
  return true
}

export function canViewLot(auction: Auction | null, lot: Pick<Lot, 'status'>, signedIn: boolean) {
  if (!auction || !canViewAuction(auction, signedIn)) return false
  if (!signedIn && lot.status === 'closed') return false
  return true
}

export function visibleAuctions(auctions: Auction[], signedIn = false) {
  return auctions.filter((auction) => canViewAuction(auction, signedIn))
}

/** Default buyer landing destination: one current auction, never another upcoming auction. */
export function buyerHomeAuctionId(auctions: Auction[], clientId?: string | null) {
  const eligible = auctions.filter((auction) =>
    auction.status === 'abierta' || auction.status === 'publicada',
  )
  const associated = clientId ? eligible.filter((auction) => auction.clientIds.includes(clientId)) : []
  return (
    associated.find((auction) => auction.status === 'abierta')?.id ??
    eligible.find((auction) => auction.status === 'abierta')?.id ??
    associated.find((auction) => auction.status === 'publicada')?.id ??
    null
  )
}

export function lotsOfAuction(lots: Lot[], auctionId: string) {
  return lots.filter((lot) => lot.auctionId === auctionId)
}

export function validateAuction(input: AuctionInput) {
  if (!input.title.trim()) return 'La subasta necesita un título.'
  if (!isAuctionStatus(input.status)) return 'Elige un estado.'
  if (input.startAt || input.endAt) {
    if (!input.startAt || !input.endAt) return 'Completa la fecha y hora de inicio y cierre.'
    if (new Date(input.endAt) <= new Date(input.startAt)) return 'El cierre debe ser posterior al inicio.'
  }
  if (input.status !== 'creada') {
    if (!input.location.trim()) return 'Escribe el lugar.'
    if (input.status !== 'cerrada') {
      if (!input.startAt || !input.endAt) return 'Completa la fecha y hora de inicio y cierre.'
      if (new Date(input.endAt).getTime() <= Date.now()) {
        return input.status === 'publicada'
          ? 'La ventana de esta subasta ya terminó. Edita las fechas para publicarla.'
          : 'La fecha y hora de cierre debe ser posterior a la hora actual.'
      }
    } else if (!input.startAt && !input.endAt && !input.dates.trim()) {
      return 'Escribe las fechas.'
    }
  }
  return null
}

export type BidBlock = 'login' | 'admin' | 'not-open' | 'unassociated' | 'hidden'

export function bidAccess(
  auction: Auction | null,
  account: Account | null,
  client: Client | null,
): { ok: true } | { ok: false; reason: BidBlock } {
  if (!auction || auction.status === 'creada') return { ok: false, reason: 'hidden' }
  if (!account) return { ok: false, reason: 'login' }
  if (account.role === 'admin') return { ok: false, reason: 'admin' }
  if (auction.status !== 'abierta') return { ok: false, reason: 'not-open' }
  if (!client || !auction.clientIds.includes(client.id)) return { ok: false, reason: 'unassociated' }
  return { ok: true }
}

export function bidDenialMessage(reason: BidBlock) {
  if (reason === 'login') return 'Inicia sesión para pujar.'
  if (reason === 'admin') return 'Los administradores no pujan en la subasta.'
  if (reason === 'unassociated') {
    return 'No estás asociado a esta subasta. Contacta con la subasta para solicitar acceso.'
  }
  if (reason === 'hidden') return 'Esta subasta no está disponible.'
  return 'La subasta no está abierta.'
}
