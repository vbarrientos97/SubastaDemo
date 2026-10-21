import assert from 'node:assert/strict'
import test from 'node:test'
import { safeInternalPath } from '@/lib/internal-path'
import { readPreference, writePreference } from '@/lib/browser-preferences'
import { readFavoritesViewCookie } from '@/lib/favorites-view'

test('return paths reject external URLs and browser slash normalization', () => {
  for (const path of ['https://evil.invalid', '//evil.invalid', '/\\evil.invalid', '/\nevil', 'javascript:alert(1)']) {
    assert.equal(safeInternalPath(path), '/')
  }
  assert.equal(safeInternalPath('/lote/lote-02?returnTo=%2Fpujas'), '/lote/lote-02?returnTo=%2Fpujas')
})

test('preferences retain the newest value when storage blocks reads or writes', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const blocked = { getItem() { throw Error('blocked') }, setItem() { throw Error('quota') } }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: blocked, sessionStorage: blocked, dispatchEvent() {} } })
  try {
    assert.equal(readPreference('test-pref'), null)
    writePreference('test-pref', 'false')
    assert.equal(readPreference('test-pref'), 'false')
    writePreference('test-session', 'true', true)
    assert.equal(readPreference('test-session', true), 'true')
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})

test('malformed favorites cookies recover to the default view', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document')
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { cookie: 'favoritos.vista=%XX' } })
  try { assert.equal(readFavoritesViewCookie(), 'columns') }
  finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous)
    else Reflect.deleteProperty(globalThis, 'document')
  }
})
