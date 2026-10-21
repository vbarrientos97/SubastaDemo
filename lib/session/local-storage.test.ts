import assert from 'node:assert/strict'
import test from 'node:test'
import { createLocalStorageSession } from '@/lib/session/local-storage'
import { createSeed } from '@/lib/session/seed'
import { isStoredSession } from '@/lib/session/validate-storage'
import { migrateSessionState, SESSION_SCHEMA_VERSION } from '@/lib/session/migrate'
import { deleteLot, deleteAuction } from '@/lib/application/session'

function browser(run: (store: Map<string, string>) => void, fail = false) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const store = new Map<string, string>()
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: {
    getItem(key: string) { if (fail) throw new Error('blocked'); return store.get(key) ?? null },
    setItem(key: string, value: string) { if (fail) throw new Error('quota'); store.set(key, value) },
  } } })
  try { run(store) } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else Reflect.deleteProperty(globalThis, 'window')
  }
}

test('deleting demo lots and auctions survives repeated loads', () => browser(() => {
  const repo = createLocalStorageSession()
  const state = repo.load()!
  state.currentUserId = 'acc-admin'
  repo.save(state)
  assert.equal(deleteLot(repo, 'lote-02').ok, true)
  assert.ok(!repo.load()!.lots.some((lot) => lot.id === 'lote-02'))
  assert.equal(deleteAuction(repo, 'subasta-brangus').ok, true)
  assert.ok(!repo.load()!.auctions.some((auction) => auction.id === 'subasta-brangus'))
  assert.ok(!repo.load()!.lots.some((lot) => lot.auctionId === 'subasta-brangus'))
}))

test('current stores preserve empty collections and edited galleries', () => browser(() => {
  const repo = createLocalStorageSession()
  const state = migrateSessionState(createSeed())
  state.lots[0].images = ['/custom.jpg']
  state.lots[0].birthDate = undefined
  repo.save(state)
  assert.deepEqual(repo.load()!.lots[0].images, ['/custom.jpg'])
  assert.equal(repo.load()!.lots[0].birthDate, undefined)
  repo.save({ ...state, auctions: [], lots: [], clients: [], accounts: [], currentUserId: null, events: [] })
  assert.deepEqual(repo.load()!.auctions, [])
  assert.deepEqual(repo.load()!.lots, [])
}))

test('schema 18 favorites migrate to the signed-in account without restoring deleted lots', () => browser((store) => {
  const state = createSeed()
  state.schemaVersion = 18
  state.currentUserId = 'acc-carlos'
  state.favoriteLotIds = ['lote-02']
  state.lots = state.lots.filter((lot) => lot.id !== 'lote-05')
  store.set('subasta.session', JSON.stringify(state))
  const repo = createLocalStorageSession()
  const migrated = repo.load()!
  assert.equal(migrated.schemaVersion, SESSION_SCHEMA_VERSION)
  assert.deepEqual(migrated.favoritesByAccount?.['acc-carlos'], ['lote-02'])
  assert.ok(!migrated.lots.some((lot) => lot.id === 'lote-05'))
  assert.deepEqual(repo.load(), migrated)
}))

test('invalid JSON and malformed entities recover to a usable demo', () => browser((store) => {
  for (const raw of ['{bad', JSON.stringify({ accounts: [null], clients: [], lots: [], auctions: [] })]) {
    store.set('subasta.session', raw)
    assert.ok(createLocalStorageSession().load()!.accounts.length > 0)
  }
  assert.equal(isStoredSession({ ...createSeed(), lots: [null] }), false)
  assert.equal(isStoredSession({ ...createSeed(), lots: [{ ...createSeed().lots[0], bids: [null] }] }), false)
  assert.equal(isStoredSession(createSeed()), true)
}))

test('blocked storage remains usable in memory', () => browser(() => {
  const repo = createLocalStorageSession()
  const state = repo.load()!
  state.currentUserId = 'acc-admin'
  repo.save(state)
  assert.equal(deleteLot(repo, 'lote-02').ok, true)
  assert.ok(!repo.load()!.lots.some((lot) => lot.id === 'lote-02'))
}, true))

test('a failed write keeps the newest state instead of reloading stale persisted data', () => browser((store) => {
  const repo = createLocalStorageSession()
  const state = repo.load()!
  state.currentUserId = 'acc-admin'
  const browserWindow = window
  const originalWrite = browserWindow.localStorage.setItem
  browserWindow.localStorage.setItem = () => { throw new Error('quota') }
  try {
    repo.save(state)
    assert.equal(deleteLot(repo, 'lote-02').ok, true)
    assert.ok(!repo.load()!.lots.some((lot) => lot.id === 'lote-02'))
    assert.ok(JSON.parse(store.get('subasta.session')!).lots.some((lot: { id: string }) => lot.id === 'lote-02'))
  } finally { browserWindow.localStorage.setItem = originalWrite }
}))

test('historical migrations run once and produce a stable current snapshot', () => browser((store) => {
  store.set('subasta.session', JSON.stringify({ ...createSeed(), schemaVersion: 4 }))
  const repo = createLocalStorageSession()
  const first = repo.load()!
  assert.equal(first.schemaVersion, SESSION_SCHEMA_VERSION)
  assert.equal(JSON.stringify(repo.load()), JSON.stringify(first))
  first.currentUserId = 'acc-admin'
  repo.save(first)
  assert.equal(deleteLot(repo, 'lote-02').ok, true)
  assert.ok(!repo.load()!.lots.some((lot) => lot.id === 'lote-02'))
}))

test('current lots reject invalid catalog flags and colors, while historical colors can migrate', () => {
  const state = createSeed()
  assert.equal(isStoredSession({ ...state, lots: [{ ...state.lots[0], inCatalog: 'false' }] }), false)
  assert.equal(isStoredSession({ ...state, lots: [{ ...state.lots[0], color: 'INVALID' }] }), false)
  assert.equal(isStoredSession({ ...state, schemaVersion: 17, lots: [{ ...state.lots[0], color: 'INVALID' }] }), true)
})

test('loading repairs duplicate ids and dangling references without restoring deleted entities', () => browser((store) => {
  const state = createSeed()
  state.currentUserId = 'acc-carlos'
  state.auctions[0].clientIds.push('missing', state.auctions[0].clientIds[0])
  state.lots.push({ ...state.lots[0], auctionId: 'missing', id: 'orphan' }, { ...state.lots[0] })
  state.favoritesByAccount = { 'acc-carlos': ['lote-02', 'missing', 'lote-02'], missing: ['lote-02'] }
  state.events.push({ id: 'orphan-event', typeId: 'other', title: 'X', startsAt: '2099-01-01', lotId: 'missing' })
  state.pendingFavoriteLotId = 'missing'
  store.set('subasta.session', JSON.stringify(state))
  const loaded = createLocalStorageSession().load()!
  assert.equal(loaded.lots.filter((row) => row.id === state.lots[0].id).length, 1)
  assert.equal(loaded.lots.some((row) => row.id === 'orphan'), false)
  assert.equal(loaded.auctions[0].clientIds.includes('missing'), false)
  assert.deepEqual(loaded.favoriteLotIds, ['lote-02'])
  assert.equal(loaded.favoritesByAccount?.missing, undefined)
  assert.equal(loaded.events.find((row) => row.id === 'orphan-event')?.lotId, undefined)
  assert.equal(loaded.pendingFavoriteLotId, null)
}))
