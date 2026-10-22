'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { subscribePreferences } from '@/lib/browser-preferences'
import { auctionSyncService } from '@/lib/demo/auction-sync'
import type { Auction, AuctionInput } from '@/lib/domain/auction'
import type { Lot } from '@/lib/domain/lot'

export function useAuctionSync(auction: Auction, draft: AuctionInput, auctionLots: Lot[]) {
  const [confirmSync, setConfirmSync] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const lastSyncedAt = useSyncExternalStore(subscribePreferences, () => auctionSyncService.getLastSyncedAt(auction.id), () => null)
  const syncingRef = useRef(false)

  async function synchronizeAuction() {
    if (syncingRef.current) return
    syncingRef.current = true
    setSyncing(true)
    setConfirmSync(false)
    setSyncMessage(null)
    try {
      const lots = auctionLots.filter((lot) => lot.auctionId === auction.id)
      await auctionSyncService.synchronize({ auction: { ...auction, ...draft, status: auction.status }, lots })
      const timestamp = new Date().toISOString()
      auctionSyncService.saveLastSyncedAt(auction.id, timestamp)
      setSyncMessage({ type: 'success', text: 'Simulación de sincronización completada.' })
    } catch (syncError) {
      setSyncMessage({
        type: 'error',
        text: syncError instanceof Error ? syncError.message : 'No se pudo sincronizar. Inténtalo de nuevo.',
      })
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }

  const lastSyncDate = lastSyncedAt ? new Date(lastSyncedAt) : null
  const formattedLastSync = lastSyncDate && !Number.isNaN(lastSyncDate.getTime())
    ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'short', timeStyle: 'short' }).format(lastSyncDate)
    : null

  return {
    confirmSync, syncing, syncMessage, formattedLastSync, synchronizeAuction,
    requestSync() { setSyncMessage(null); setConfirmSync(true) },
    cancelSync() { setConfirmSync(false) },
  }
}
