import assert from 'node:assert/strict'
import test from 'node:test'
import { createNotificationStore, NOTIFICATIONS_PREFIX } from '@/lib/notifications/store'

function fixture() {
  const data = new Map<string, string>()
  let blocked = false
  const store = createNotificationStore(() => ({
    getItem(key) { if (blocked) throw Error('blocked'); return data.get(key) ?? null },
    setItem(key, value) { if (blocked) throw Error('quota'); data.set(key, value) },
  }))
  return { data, store, block() { blocked = true } }
}

test('notification JSON is validated before the UI consumes it', () => {
  for (const value of ['invalid', '{}', '[null]', '[{"type":"unknown"}]']) {
    const { data, store } = fixture()
    data.set(NOTIFICATIONS_PREFIX + 'carlos', value)
    assert.doesNotThrow(() => store.load('carlos').map((row) => row.id))
  }
  const { data, store } = fixture()
  const valid = store.load('carlos')[0]
  data.set(NOTIFICATIONS_PREFIX + 'carlos', JSON.stringify([valid, valid, { ...valid, createdAt: 'invalid' }, { ...valid, type: 'unknown' }]))
  assert.deepEqual(store.load('carlos'), [valid])
})

test('read state and notifications remain isolated between accounts', () => {
  const { store } = fixture()
  const carlos = store.load('carlos').map((row) => ({ ...row, read: true }))
  store.save('carlos', carlos)
  assert.ok(store.load('carlos').every((row) => row.read))
  assert.ok(store.load('omar').some((row) => !row.read))
})

test('failed writes and blocked reads retain the latest state in memory', () => {
  const f = fixture()
  const rows = f.store.load('carlos').map((row) => ({ ...row, read: true }))
  f.block()
  f.store.save('carlos', rows)
  assert.deepEqual(f.store.load('carlos'), rows)
  assert.ok(f.store.load('omar').some((row) => !row.read))
})

test('legacy global notifications migrate only to the first account', () => {
  const { store, data } = fixture()
  data.set('subasta.notificaciones-demo.v1', JSON.stringify([{ id: 'old', type: 'won', lotId: 'lote-03', lotOrder: 3, createdAt: '2026-01-01', read: true }]))
  assert.equal(store.load('carlos')[0].id, 'old')
  assert.notEqual(store.load('omar')[0].id, 'old')
})
