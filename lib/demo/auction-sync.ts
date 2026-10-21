import type { Auction } from '@/lib/domain/auction'
import type { Lot } from '@/lib/domain/lot'
import { readPreference, writePreference } from '@/lib/browser-preferences'

export type AuctionSyncPayload = {
  auction: Auction
  lots: Lot[]
}

// Cambiar a true para probar localmente el mensaje de error.
export const SIMULATE_AUCTION_SYNC_ERROR = false

const SYNC_TIMESTAMP_KEY = 'subasta.last-sync.'
const syncingAuctions = new Set<string>()

/**
 * Demo only: reemplazar synchronize() por la integración real.
 * TODO producción: definir endpoint, mecanismo de autenticación y formato/versionado del payload.
 */
export const auctionSyncService = {
  async synchronize({ auction }: AuctionSyncPayload) {
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
  getLastSyncedAt(auctionId: string) {
    return readPreference(`${SYNC_TIMESTAMP_KEY}${auctionId}`)
  },
  saveLastSyncedAt(auctionId: string, timestamp: string) {
    writePreference(`${SYNC_TIMESTAMP_KEY}${auctionId}`, timestamp)
  },
}
