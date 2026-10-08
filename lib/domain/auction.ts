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
  if (status === 'abierta') return 'text-emerald-600 dark:text-emerald-400'
  if (status === 'cerrada') return 'text-red-600 dark:text-red-400'
  if (status === 'publicada') return 'text-orange-600 dark:text-orange-400'
  return 'text-muted-foreground'
}

export function auctionStatusBadgeColor(status: AuctionStatus) {
  if (status === 'abierta') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
  if (status === 'cerrada') return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
  if (status === 'publicada') return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
  return 'bg-surface-2 text-muted-foreground'
}

export function auctionStatusActions(
  status: AuctionStatus,
): { status: AuctionStatus; label: string; primary?: boolean }[] {
  if (status === 'creada') {
    return [{ status: 'publicada' as const, label: 'Publicar', primary: true }]
  }
  if (status === 'publicada') return [{ status: 'abierta' as const, label: 'Abrir', primary: true }]
  if (status === 'abierta') return [{ status: 'cerrada' as const, label: 'Cerrar' }]
  return [{ status: 'publicada' as const, label: 'Publicar de nuevo', primary: true }]
}

export function validateAuctionTransition(
  currentStatus: AuctionStatus | null,
  nextStatus: AuctionStatus,
) {
  if (nextStatus === 'abierta' && currentStatus !== 'publicada' && currentStatus !== 'abierta') {
    return 'Publica la subasta antes de abrirla.'
  }
  return null
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

export function lotsOfAuction(lots: Lot[], auctionId: string) {
  return lots.filter((lot) => lot.auctionId === auctionId)
}

export function validateAuction(input: AuctionInput) {
  if (!input.title.trim()) return 'La subasta necesita un título.'
  if (!isAuctionStatus(input.status)) return 'Elige un estado.'
  if (input.status !== 'creada') {
    if (!input.location.trim()) return 'Escribe el lugar.'
    if (input.startAt || input.endAt) {
      if (!input.startAt || !input.endAt) return 'Completa la fecha y hora de inicio y cierre.'
      if (new Date(input.endAt) <= new Date(input.startAt)) return 'El cierre debe ser posterior al inicio.'
    } else if (!input.dates.trim()) {
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
