import assert from 'node:assert/strict'
import test from 'node:test'
import { addFavoriteId, isFavorite, pruneFavoriteIds, toggleFavoriteId } from '@/lib/domain/favorites'
import { buyerBidSections, buyerLotBorderTone, hasBidFromClient } from '@/lib/domain/buyer-bids'
import { validateEvent } from '@/lib/domain/event'
import { paginateLots, validateLot, type Lot } from '@/lib/domain/lot'
import {
  auctionStatusActions,
  bidAccess,
  canViewAuction,
  canViewLot,
  validateAuction,
  type Auction,
} from '@/lib/domain/auction'
import { migrateSessionState, type SessionState, type StoredSession } from '@/lib/application/session-repository'
import { placeBid } from '@/lib/application/session'
import { createSeed } from '@/lib/session/seed'
import type { Account, Client } from '@/lib/domain/account'

test('toggleFavoriteId adds and removes', () => {
  assert.deepEqual(toggleFavoriteId([], 'a'), ['a'])
  assert.deepEqual(toggleFavoriteId(['a'], 'a'), [])
  assert.equal(isFavorite(['a', 'b'], 'b'), true)
})

test('addFavoriteId keeps an existing id', () => {
  assert.deepEqual(addFavoriteId(['a'], 'a'), ['a'])
  assert.deepEqual(addFavoriteId(['a'], 'b'), ['a', 'b'])
})

test('pruneFavoriteIds drops orphans', () => {
  assert.deepEqual(
    pruneFavoriteIds(['lote-01', 'gone'], [{ id: 'lote-01' } as Lot]),
    ['lote-01'],
  )
})

test('validateEvent rejects bad ranges', () => {
  assert.equal(
    validateEvent({
      typeId: 'auction',
      title: 'X',
      startsAt: '2026-01-02T00:00:00.000Z',
      endsAt: '2026-01-01T00:00:00.000Z',
    }),
    'La fecha de fin debe ser posterior al inicio.',
  )
  assert.equal(
    validateEvent({
      typeId: 'auction',
      title: 'X',
      startsAt: '2026-01-02T00:00:00.000Z',
    }),
    null,
  )
})

test('paginateLots', () => {
  const page = paginateLots([1, 2, 3], 1, 1)
  assert.equal(page.items.length, 1)
  assert.equal(page.totalPages, 3)
})

const lotFields = {
  seller: '',
  color: '',
  sire: '',
  dam: '',
  youtubeUrl: '',
  images: [] as string[],
}

test('validateLot and validateAuction', () => {
  assert.equal(
    validateLot({ title: '', breed: 'Brahman', category: 'macho', price: 1, status: 'upcoming', ...lotFields }),
    'El lote necesita un nombre.',
  )
  assert.equal(
    validateAuction({ title: 'Remate', location: '', dates: 'Hoy', status: 'abierta' }),
    'Escribe el lugar.',
  )
  assert.equal(validateAuction({ title: 'Borrador', location: '', dates: '', status: 'creada' }), null)
  assert.equal(
    validateAuction({ title: 'Remate', location: 'David', dates: '', status: 'publicada' }),
    'Escribe las fechas.',
  )
})

test('auction status actions expose the expected transitions', () => {
  assert.deepEqual(auctionStatusActions('creada').map((action) => action.status), ['publicada'])
  assert.deepEqual(auctionStatusActions('publicada').map((action) => action.status), ['abierta'])
  assert.deepEqual(auctionStatusActions('abierta').map((action) => action.status), ['cerrada'])
  assert.deepEqual(auctionStatusActions('cerrada').map((action) => action.status), ['publicada'])
})

test('migrateSessionState renames legacy incomplete auctions to created', () => {
  const legacy = {
    accounts: [],
    currentUserId: null,
    auctions: [{
      id: 'legacy', status: 'incompleta', title: 'Borrador', location: '', focus: '', closeLabel: '',
      dates: '', totalLots: 0, connected: 0, clientIds: [],
    }],
    lots: [],
    clients: [],
  } as unknown as StoredSession
  assert.equal(migrateSessionState(legacy).auctions[0].status, 'creada')
})

function auction(status: Auction['status'], clientIds: string[] = []): Auction {
  return {
    id: 'subasta',
    status,
    title: 'Remate',
    location: 'David',
    focus: '',
    closeLabel: '',
    dates: 'Hoy',
    totalLots: 1,
    connected: 0,
    clientIds,
  }
}

const buyer: Account = {
  id: 'cuenta',
  role: 'buyer',
  username: 'carlos',
  email: 'carlos@subasta.pa',
  password: 'x',
  clientId: 'carlos',
}

const client: Client = { id: 'carlos', name: 'Carlos', paddle: '42', regionId: 'boqueron' }

test('guests do not see closed auctions or sold lots', () => {
  const closed = auction('cerrada')
  const open = auction('abierta')
  assert.equal(canViewAuction(closed, false), false)
  assert.equal(canViewAuction(closed, true), true)
  assert.equal(canViewAuction(open, false), true)
  assert.equal(canViewLot(open, { status: 'closed' }, false), false)
  assert.equal(canViewLot(open, { status: 'live' }, false), true)
  assert.equal(canViewLot(closed, { status: 'closed' }, false), false)
  assert.equal(canViewLot(open, { status: 'closed' }, true), true)
})

test('bidAccess follows auction status and association', () => {
  assert.equal(bidAccess(auction('creada'), null, null).ok, false)
  assert.deepEqual(bidAccess(auction('publicada'), null, null), { ok: false, reason: 'login' })
  assert.deepEqual(bidAccess(auction('abierta', ['carlos']), buyer, client), { ok: true })
  assert.deepEqual(bidAccess(auction('abierta', []), buyer, client), { ok: false, reason: 'unassociated' })
  assert.deepEqual(bidAccess(auction('cerrada', ['carlos']), buyer, client), { ok: false, reason: 'not-open' })
  assert.equal(
    bidAccess(auction('abierta', ['carlos']), { ...buyer, role: 'admin', clientId: undefined }, null).ok,
    false,
  )
})

test('buyer bid sections classify associated lots once and support legacy bidder names', () => {
  const makeLot = (overrides: Partial<Lot> & Pick<Lot, 'id' | 'auctionId' | 'status'>): Lot => ({
    order: 1,
    title: 'Lote',
    registeredName: 'Lote de prueba',
    category: 'macho',
    image: '',
    headCount: 1,
    weightKg: 0,
    pricePerKg: 0,
    currentBid: 100,
    minIncrement: 10,
    secondsLeft: overrides.status === 'closed' || overrides.status === 'upcoming' ? null : 30,
    breed: 'Brahman',
    ...overrides,
  })
  const lots = [
    makeLot({ id: 'active', auctionId: 'associated', status: 'live', leader: 'Carlos', leaderClientId: client.id, bids: [{ bidder: 'Carlos', bidderClientId: 'carlos', amount: 100, date: '', time: '' }] }),
    makeLot({ id: 'following', auctionId: 'associated', status: 'upcoming' }),
    makeLot({ id: 'won', auctionId: 'associated', status: 'closed', winnerClientId: 'carlos', soldToPaddle: 42 }),
    makeLot({ id: 'finished', auctionId: 'associated', status: 'closed', soldToPaddle: 23, bids: [{ bidder: ' Carlos ', amount: 100, date: '', time: '' }] }),
    makeLot({ id: 'unassociated', auctionId: 'other', status: 'live', bids: [{ bidder: 'Carlos', amount: 100, date: '', time: '' }] }),
  ]

  assert.equal(hasBidFromClient(lots[0], client), true)
  const sections = buyerBidSections(lots, client, ['associated'], ['following', 'won'])
  assert.deepEqual(sections.active.map((lot) => lot.id), ['active'])
  assert.deepEqual(sections.following.map((lot) => lot.id), ['following'])
  assert.deepEqual(sections.won.map((lot) => lot.id), ['won'])
  assert.deepEqual(sections.finished.map((lot) => lot.id), ['finished'])
  assert.equal(buyerLotBorderTone(lots[0], client), 'green')
  assert.equal(buyerLotBorderTone(lots[1], client), 'neutral')
  assert.equal(buyerLotBorderTone(lots[2], client), 'green')
  assert.equal(buyerLotBorderTone(lots[3], client), 'red')
  assert.equal(
    buyerLotBorderTone(
      makeLot({
        id: 'losing', auctionId: 'associated', status: 'live', leader: 'Otra persona',
        leaderClientId: 'otro', bids: [{ bidder: 'Carlos', bidderClientId: client.id, amount: 100, date: '', time: '' }],
      }),
      client,
    ),
    'orange',
  )
  assert.equal(
    buyerLotBorderTone(
      makeLot({
        id: 'closing', auctionId: 'associated', status: 'imminent', secondsLeft: 5,
        leader: 'Carlos', leaderClientId: client.id,
        bids: [{ bidder: 'Carlos', bidderClientId: client.id, amount: 100, date: '', time: '' }],
      }),
      client,
    ),
    'red',
  )
})

test('new bids persist the buyer client id', () => {
  let stored: SessionState = {
    accounts: [buyer],
    currentUserId: buyer.id,
    auctions: [auction('abierta', [client.id])],
    lots: [{
      id: 'active', auctionId: 'subasta', order: 1, title: 'Lote', registeredName: '',
      category: 'macho' as const, status: 'live' as const, image: '', headCount: 1,
      weightKg: 0, pricePerKg: 0, currentBid: 100, minIncrement: 10, secondsLeft: 30,
      breed: 'Brahman',
    }],
    clients: [client],
    favoriteLotIds: [],
    events: [],
  }
  const result = placeBid({
    load: () => stored,
    save: (next) => { stored = next },
  }, 'active', 110)

  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.lots[0].bids?.[0].bidderClientId, client.id)
    assert.equal(result.value.lots[0].leaderClientId, client.id)
  }
})

test('demo buyer starts with both a leading and a trailing active bid', () => {
  const state = createSeed()
  const demoClient = state.clients.find((item) => item.id === 'carlos-santiago')!
  const associatedAuctionIds = state.auctions
    .filter((item) => item.clientIds.includes(demoClient.id))
    .map((item) => item.id)
  const sections = buyerBidSections(state.lots, demoClient, associatedAuctionIds, state.favoriteLotIds)
  const byId = new Map(state.lots.map((lot) => [lot.id, lot]))

  assert.deepEqual(sections.active.map((lot) => lot.id), ['lote-02', 'lote-05'])
  assert.equal(buyerLotBorderTone(byId.get('lote-02')!, demoClient), 'orange')
  assert.equal(buyerLotBorderTone(byId.get('lote-05')!, demoClient), 'green')
})
