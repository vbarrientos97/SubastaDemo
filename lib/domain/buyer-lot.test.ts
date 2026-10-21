import assert from 'node:assert/strict'
import test from 'node:test'
import { createSeed } from '@/lib/session/seed'
import { sanitizeLotsForBuyer } from '@/lib/domain/buyer-lot'
import { buyerBidSections, buyerLotBorderTone } from '@/lib/domain/buyer-bids'
import { validateBidAmount } from '@/lib/domain/lot'

test('anonymous buyer projection preserves sections and border tones without exposing identities', () => {
  const state = createSeed()
  const client = state.clients.find((row) => row.id === 'carlos-santiago')!
  const lots = sanitizeLotsForBuyer(state.lots.filter((lot) => lot.inCatalog !== false), client)
  const sections = buyerBidSections(lots, ['subasta-carlos'], [])
  assert.deepEqual(sections.active.map((lot) => lot.id), ['lote-02', 'lote-05'])
  assert.deepEqual(sections.won.map((lot) => lot.id), ['lote-03'])
  assert.equal(buyerLotBorderTone(lots.find((lot) => lot.id === 'lote-02')!), 'orange')
  assert.equal(buyerLotBorderTone(lots.find((lot) => lot.id === 'lote-05')!), 'green')
  assert.equal(buyerLotBorderTone(sections.won[0]), 'green')
  for (const lot of lots) {
    assert.equal('winnerClientId' in lot || 'soldToPaddle' in lot || 'leaderClientId' in lot, false)
    assert.ok(lot.bids?.every((bid) => !('bidderClientId' in bid) && bid.bidder !== client.name) ?? true)
    if (lot.status === 'closed') assert.equal('bids' in lot, false)
  }
  const visitor = sanitizeLotsForBuyer(state.lots, null)
  assert.ok(visitor.every((lot) => !lot.hasOwnBid && !lot.isOwnLeader && lot.buyerOutcome !== 'won'))
})

test('bid minimum permits higher amounts without requiring a multiple', () => {
  const lot = { currentBid: 100, minIncrement: 50 }
  for (const value of [149, 150.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.notEqual(validateBidAmount(lot, value), null)
  for (const value of [150, 151, 200]) assert.equal(validateBidAmount(lot, value), null)
})
