import assert from 'node:assert/strict'
import test from 'node:test'
import * as commands from '@/lib/application/session'
import { migrateSessionState, type SessionState } from '@/lib/application/session-repository'
import { createSeed } from '@/lib/session/seed'
import { validateAuction } from '@/lib/domain/auction'

function fixture(role: 'buyer' | 'admin' | null = 'buyer') {
  let state = migrateSessionState(createSeed())
  state.currentUserId = role === 'buyer' ? 'acc-carlos' : role === 'admin' ? 'acc-admin' : null
  state.currentAuctionId = role === 'buyer' ? 'subasta-carlos' : null
  state.auctions = state.auctions.map((auction) => auction.id === 'subasta-carlos' ? { ...auction, status: 'abierta', startAt: '2020-01-01', endAt: '2099-01-01' } : auction)
  const repo = { load: () => state, save: (next: SessionState) => { state = next } }
  return { repo, get state() { return state } }
}

test('bids reject inactive and non-catalog lots without changing state', () => {
  for (const status of ['closed', 'upcoming'] as const) {
    const f = fixture()
    f.state.lots[0].status = status
    const before = JSON.stringify(f.state)
    assert.equal(commands.placeBid(f.repo, f.state.lots[0].id, 999999).ok, false)
    assert.equal(JSON.stringify(f.state), before)
  }
  const f = fixture()
  f.state.lots[0].status = 'live'
  f.state.lots[0].inCatalog = false
  assert.equal(commands.placeBid(f.repo, f.state.lots[0].id, 999999).ok, false)
})

test('bids require safe whole amounts and preserve the minimum-price invariant', () => {
  const f = fixture()
  const lot = f.state.lots.find((item) => item.id === 'lote-02')!
  for (const amount of [lot.currentBid, lot.currentBid - 1, lot.currentBid + 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(commands.placeBid(f.repo, lot.id, amount).ok, false)
  }
  assert.equal(commands.placeBid(f.repo, lot.id, lot.currentBid + 1).ok, true)
  assert.equal(f.state.lots.find((item) => item.id === lot.id)?.currentBid, lot.currentBid + 1)
})

test('administrative commands reject buyers and visitors before changing anything', () => {
  for (const role of ['buyer', null] as const) {
    const f = fixture(role)
    const before = JSON.stringify(f.state)
    const auction = { title: 'X', location: '', dates: '', status: 'creada' as const }
    const client = { name: 'X', paddle: '9999', regionId: f.state.clients[0].regionId }
    const lot = { title: 'X', breed: 'Brahman', category: 'macho' as const, price: 1, status: 'upcoming' as const, seller: '', color: 'Gris', sire: '', dam: '', youtubeUrl: '', images: [] }
    const event = { title: 'X', typeId: 'other', startsAt: '2099-01-01' }
    const results = [
      commands.createAuction(f.repo, auction), commands.updateAuction(f.repo, 'subasta-carlos', auction), commands.deleteAuction(f.repo, 'subasta-carlos'),
      commands.setAuctionClients(f.repo, 'subasta-carlos', []), commands.createClient(f.repo, client), commands.updateClient(f.repo, 'omar', client), commands.deleteClient(f.repo, 'omar'),
      commands.createLot(f.repo, 'subasta-carlos', lot), commands.updateLot(f.repo, 'lote-02', lot), commands.deleteLot(f.repo, 'lote-02'),
      commands.createEvent(f.repo, event), commands.updateEvent(f.repo, 'missing', event), commands.deleteEvent(f.repo, 'missing'),
    ]
    assert.ok(results.every((result) => !result.ok))
    assert.equal(JSON.stringify(f.state), before)
  }
})

test('favorites stay with each account, including pending favorites', () => {
  const f = fixture()
  assert.equal(commands.toggleFavorite(f.repo, 'lote-02').ok, true)
  commands.signOut(f.repo)
  assert.deepEqual(f.state.favoriteLotIds, [])
  commands.signIn(f.repo, { login: 'omar', password: 'omar' }, 'subasta-carlos')
  assert.deepEqual(f.state.favoriteLotIds, [])
  commands.savePendingFavorite(f.repo, 'lote-05')
  commands.consumePendingFavorite(f.repo)
  assert.deepEqual(f.state.favoriteLotIds, ['lote-05'])
  commands.signIn(f.repo, { login: 'carlos', password: 'carlos' }, 'subasta-carlos')
  assert.deepEqual(f.state.favoriteLotIds, ['lote-02'])
})

test('auction deletion prunes all accounts, pending references, events and selected auction', () => {
  const f = fixture('admin')
  f.state.favoritesByAccount = { 'acc-carlos': ['lote-02'], 'acc-omar': ['lote-02'] }
  f.state.pendingFavoriteLotId = 'lote-02'
  f.state.currentAuctionId = 'subasta-carlos'
  f.state.events.push({ id: 'linked', typeId: 'auction', title: 'X', startsAt: '2099-01-01', lotId: 'lote-02' })
  assert.equal(commands.deleteAuction(f.repo, 'subasta-carlos').ok, true)
  assert.equal(f.state.currentAuctionId, null)
  assert.equal(f.state.pendingFavoriteLotId, null)
  assert.equal(f.state.events.find((event) => event.id === 'linked')?.lotId, undefined)
  assert.deepEqual(f.state.favoritesByAccount?.['acc-carlos'], [])
  assert.deepEqual(f.state.favoritesByAccount?.['acc-omar'], [])
})

test('client deletion preserves commercial history and cleans unused associations', () => {
  const f = fixture('admin')
  assert.equal(commands.deleteClient(f.repo, 'carlos-santiago').ok, false)
  const client = { id: 'unused', name: 'Unused', paddle: '9999', regionId: f.state.clients[0].regionId }
  f.state.clients.push(client)
  f.state.auctions[0].clientIds.push(client.id)
  assert.equal(commands.deleteClient(f.repo, client.id).ok, true)
  assert.ok(f.state.auctions.every((auction) => !auction.clientIds.includes(client.id)))
})

test('date validation rejects invalid and reversed ranges', () => {
  const input = { title: 'X', location: 'Y', dates: '', status: 'publicada' as const, startAt: 'invalid', endAt: 'invalid' }
  assert.notEqual(validateAuction(input), null)
  assert.notEqual(validateAuction({ ...input, startAt: '2099-02-01', endAt: '2099-01-01' }), null)
  assert.equal(validateAuction({ ...input, startAt: '2099-01-01', endAt: '2099-02-01' }), null)
})

test('repository failures become explicit command errors', () => {
  const f = fixture()
  const result = commands.placeBid({ load: f.repo.load, save() { throw new Error('disk') } }, 'lote-02', 999999)
  assert.equal(result.ok, false)
})
