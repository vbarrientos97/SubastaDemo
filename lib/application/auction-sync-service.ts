import type { Auction } from '@/lib/domain/auction'
import type { Lot } from '@/lib/domain/lot'

export type AuctionSyncPayload = {
  auction: Auction
  lots: Lot[]
}

export interface AuctionSyncService {
  synchronize(payload: AuctionSyncPayload): Promise<void>
  getLastSyncedAt(auctionId: string): string | null
  saveLastSyncedAt(auctionId: string, timestamp: string): void
}

// Cambiar a true para probar localmente el mensaje de error.
export const SIMULATE_AUCTION_SYNC_ERROR = false

const SYNC_TIMESTAMP_KEY = 'subasta.last-sync.'
const syncingAuctions = new Set<string>()

/**
 * Demo only: reemplazar synchronize() por la integración real.
 * TODO producción: definir endpoint, mecanismo de autenticación y formato/versionado del payload.
 */
export const auctionSyncService: AuctionSyncService = {
  async synchronize({ auction, lots }) {
    if (syncingAuctions.has(auction.id)) {
      throw new Error('La sincronización de esta subasta ya está en curso.')
    }

    syncingAuctions.add(auction.id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      if (SIMULATE_AUCTION_SYNC_ERROR) {
        throw new Error('No se pudo sincronizar la subasta. Inténtalo de nuevo.')
      }
      // TODO producción: enviar la subasta y sus lotes (incluido Lot.color) al sistema en vivo desde un servicio seguro.
    } finally {
      syncingAuctions.delete(auction.id)
    }
  },
  getLastSyncedAt(auctionId) {
    try {
      return window.localStorage.getItem(`${SYNC_TIMESTAMP_KEY}${auctionId}`)
    } catch {
      return null
    }
  },
  saveLastSyncedAt(auctionId, timestamp) {
    try {
      window.localStorage.setItem(`${SYNC_TIMESTAMP_KEY}${auctionId}`, timestamp)
    } catch {
      // La sincronización mock funciona aunque el navegador no permita guardar el registro local.
    }
  },
}
