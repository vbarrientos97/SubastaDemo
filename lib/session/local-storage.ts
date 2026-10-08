import type { SessionRepository, StoredSession } from '@/lib/application/session-repository'
import { migrateSessionState, SESSION_SCHEMA_VERSION } from '@/lib/application/session-repository'
import { lots as catalogLots } from '@/lib/data/auction'
import { createSeed } from '@/lib/session/seed'

const KEY = 'subasta.session'

function isState(value: unknown): value is StoredSession {
  if (!value || typeof value !== 'object') return false
  const state = value as StoredSession
  const hasAuction = Array.isArray(state.auctions) || (!!state.auction && typeof state.auction === 'object')
  return Array.isArray(state.accounts) && Array.isArray(state.lots) && Array.isArray(state.clients) && hasAuction
}

export function createLocalStorageSession(): SessionRepository {
  return {
    load() {
      if (typeof window === 'undefined') return null
      try {
        const raw = window.localStorage.getItem(KEY)
        if (raw) {
          const parsed: unknown = JSON.parse(raw)
          if (isState(parsed)) {
            const migrated = migrateSessionState(parsed)
            let changed = (parsed.schemaVersion ?? 0) < SESSION_SCHEMA_VERSION
            const upcomingAuctionId = 'subasta-brangus'
            const upcomingCatalogIds = new Set(
              catalogLots.filter((lot) => lot.status === 'upcoming').map((lot) => lot.id),
            )
            const lotsWithoutPlaceholders = migrated.lots.filter(
              (lot) => lot.id !== 'lote-brangus-1' && lot.id !== 'lote-brangus-2',
            )
            if (lotsWithoutPlaceholders.length !== migrated.lots.length) changed = true
            migrated.lots = lotsWithoutPlaceholders.map((lot) => {
              if (!upcomingCatalogIds.has(lot.id) || lot.auctionId === upcomingAuctionId) return lot
              changed = true
              return { ...lot, auctionId: upcomingAuctionId }
            })

            const seededNextAuction = createSeed().auctions.find(
              (auction) => auction.id === upcomingAuctionId,
            )
            if (seededNextAuction && !migrated.auctions.some((auction) => auction.id === upcomingAuctionId)) {
              migrated.auctions = [...migrated.auctions, seededNextAuction]
              changed = true
            }
            migrated.auctions = migrated.auctions.map((auction) => {
              if (auction.id !== upcomingAuctionId) return auction
              const clientIds = Array.from(new Set([...auction.clientIds, 'carlos-santiago']))
              const totalLots = migrated.lots.filter((lot) => lot.auctionId === upcomingAuctionId).length
              if (
                auction.status !== 'publicada' ||
                auction.dates !== 'Próximamente' ||
                auction.totalLots !== totalLots ||
                clientIds.length !== auction.clientIds.length
              ) changed = true
              return { ...auction, status: 'publicada', dates: 'Próximamente', clientIds, totalLots }
            })
            if (!Array.isArray(parsed.favoriteLotIds)) changed = true
            if (!Array.isArray(parsed.events) || (migrated.schemaVersion ?? 0) < 2) {
              if (migrated.events.length === 0) {
                migrated.events = createSeed().events
              }
              changed = true
            }
            const catalogById = new Map(catalogLots.map((lot) => [lot.id, lot]))
            const known = new Set(migrated.lots.map((lot) => lot.id))
            const missing = catalogLots.filter((lot) => !known.has(lot.id))
            migrated.lots = migrated.lots.map((lot) => {
              const source = catalogById.get(lot.id)
              if (!source) return lot
              const needsParents = !lot.sire && !lot.dam && (source.sire || source.dam)
              const needsClose = source.closesAtLabel && lot.closesAtLabel !== source.closesAtLabel
              const needsOpen = source.opensAtLabel && lot.opensAtLabel !== source.opensAtLabel
              if (!needsParents && !needsClose && !needsOpen) return lot
              changed = true
              return {
                ...lot,
                sire: lot.sire ?? source.sire,
                dam: lot.dam ?? source.dam,
                opensAtLabel: source.opensAtLabel ?? lot.opensAtLabel,
                closesAtLabel: source.closesAtLabel ?? lot.closesAtLabel,
              }
            })
            if (missing.length > 0) {
              migrated.lots = [
                ...migrated.lots,
                ...missing.map((lot) =>
                  lot.status === 'upcoming' ? { ...lot, auctionId: 'subasta-brangus' } : lot,
                ),
              ]
              changed = true
            }
            if ((parsed.schemaVersion ?? 0) < 10) {
              const demoClient = migrated.clients.find((client) => client.id === 'carlos-santiago')
              if (demoClient) {
                const demoLots = new Map(
                  createSeed().lots
                    .filter((lot) => lot.id === 'lote-02' || lot.id === 'lote-05')
                    .map((lot) => [lot.id, lot]),
                )
                migrated.lots = migrated.lots.map((lot) => {
                  const demoLot = demoLots.get(lot.id)
                  if (!demoLot || lot.status !== demoLot.status || lot.currentBid !== demoLot.currentBid) return lot
                  const alreadyParticipated = (lot.bids ?? []).some((bid) =>
                    bid.bidderClientId
                      ? bid.bidderClientId === demoClient.id
                      : bid.bidder.trim().toLocaleLowerCase() === demoClient.name.trim().toLocaleLowerCase(),
                  )
                  if (alreadyParticipated) return lot
                  changed = true
                  return {
                    ...lot,
                    leader: demoLot.leader,
                    leaderClientId: demoLot.leaderClientId,
                    bids: demoLot.bids,
                  }
                })
              }
            }
            // Keep the demo realistic for existing browsers that already have the
            // sample buyer leading every active lot. Leave one active lead as an example.
            if ((parsed.schemaVersion ?? 0) < 12) {
              const demoClient = migrated.clients.find((client) => client.id === 'carlos-santiago')
              if (demoClient) migrated.lots = migrated.lots.map((lot) => {
                const isDemoBuyerBid = (bid: NonNullable<typeof lot.bids>[number]) =>
                  bid.bidderClientId
                    ? bid.bidderClientId === demoClient.id
                    : bid.bidder.trim().toLocaleLowerCase() === demoClient.name.trim().toLocaleLowerCase()
                const isDemoBuyerLeading = lot.leaderClientId
                  ? lot.leaderClientId === demoClient.id
                  : lot.leader?.trim().toLocaleLowerCase() === demoClient.name.trim().toLocaleLowerCase()
                const hasDemoBid = (lot.bids ?? []).some(isDemoBuyerBid)
                if (
                  lot.id === 'lote-05' && isDemoBuyerLeading && hasDemoBid &&
                  ['extended', 'live', 'imminent'].includes(lot.status)
                ) {
                  return lot
                }
                if (
                  !isDemoBuyerLeading || !hasDemoBid ||
                  !['extended', 'live', 'imminent'].includes(lot.status)
                ) return lot
                const amount = lot.currentBid + lot.minIncrement
                const now = new Date()
                changed = true
                return {
                  ...lot,
                  currentBid: amount,
                  leader: 'Otro pujador',
                  leaderClientId: 'demo-competidor',
                  bids: [
                    ...(lot.bids ?? []),
                    {
                      bidder: 'Otro pujador',
                      bidderClientId: 'demo-competidor',
                      amount,
                      date: now.toLocaleDateString('es-PA'),
                      time: now.toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit' }),
                    },
                  ],
                }
              })
            }
            const demoVideoIds = ['jNQXAC9IVRw', 'Ujuzm0sYFiI', 'Lj5pdgDFx0I', 'muh4Jv5eJvQ', 'yIeSvLSEEcI']
            const hasIncompleteDemoGallery = migrated.lots.some((lot) =>
              catalogById.has(lot.id) &&
              (lot.images?.length !== 4 || demoVideoIds.some((id) => lot.youtubeUrl?.includes(id))),
            )
            if ((parsed.schemaVersion ?? 0) < 8 || hasIncompleteDemoGallery) {
              migrated.lots = migrated.lots.map((lot) => {
                const source = catalogById.get(lot.id)
                if (!source) return lot
                const currentPhotos = (lot.images?.length ? lot.images : [lot.image]).filter(
                  (photo) => photo && photo !== '/cattle/certificate-example.svg',
                )
                const animalPhotos = Array.from(
                  new Set([
                    lot.image || source.image,
                    ...currentPhotos.filter((photo) => photo !== lot.image),
                    ...(source.images ?? []).filter(
                      (photo) => photo !== source.image && photo !== '/cattle/certificate-example.svg',
                    ),
                  ]),
                ).slice(0, 3)
                const images = [...animalPhotos, '/cattle/certificate-example.svg']
                const isDemoVideo = demoVideoIds.some((id) => lot.youtubeUrl?.includes(id))
                const youtubeUrl = isDemoVideo ? source.youtubeUrl : lot.youtubeUrl ?? source.youtubeUrl
                if (
                  images.length !== lot.images?.length ||
                  images.some((photo, index) => photo !== lot.images?.[index]) ||
                  youtubeUrl !== lot.youtubeUrl
                ) changed = true
                return { ...lot, images, youtubeUrl }
              })
            }
            migrated.auctions = migrated.auctions.map((auction) =>
              auction.id === upcomingAuctionId
                ? { ...auction, totalLots: migrated.lots.filter((lot) => lot.auctionId === auction.id).length }
                : auction,
            )
            migrated.schemaVersion = SESSION_SCHEMA_VERSION
            if (changed) {
              window.localStorage.setItem(KEY, JSON.stringify(migrated))
            }
            return migrated
          }
        }
      } catch {
        /* replace a broken store with the seed */
      }
      const seeded = createSeed()
      window.localStorage.setItem(KEY, JSON.stringify(seeded))
      return seeded
    },
    save(state) {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ ...state, schemaVersion: SESSION_SCHEMA_VERSION }),
      )
    },
  }
}
