'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { AuctionCreateForm } from '@/components/admin/auction-create-form'
import { emptyAuctionDraft } from '@/components/admin/auction-fields'
import { AuctionAdminFilters, type AuctionFilters } from '@/components/admin/auction-admin-filters'
import { AuctionAdminRow } from '@/components/admin/auction-admin-row'
import { StatusActionConfirmation, auctionStatusInput } from '@/components/admin/auction-status-controls'
import type { Auction, AuctionStatus } from '@/lib/domain/auction'
import { filterTriggerClass, panel } from '@/lib/styles'

export { AuctionEditor } from '@/components/admin/auction-editor'

export function AuctionAdminList() {
  const { state, createAuction, updateAuction, deleteAuction } = useSession()
  const [suggestAddLots, setSuggestAddLots] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<AuctionFilters>({ name: '', location: '', date: null })
  const [pendingStatusAction, setPendingStatusAction] = useState<{ auctionId: string; status: AuctionStatus } | null>(null)
  const [statusActionError, setStatusActionError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!state) return null

  function createAndSuggest(input: typeof emptyAuctionDraft) {
    const message = createAuction(input)
    setError(message)
    if (!message) setSuggestAddLots(true)
    return message
  }

  function confirmStatusAction(auction: Auction, status: AuctionStatus) {
    const message = updateAuction(auction.id, auctionStatusInput(auction, status))
    setStatusActionError(message)
    if (!message) setPendingStatusAction(null)
  }

  const normalizedFilters = {
    name: filters.name.trim().toLocaleLowerCase(),
    location: filters.location.trim().toLocaleLowerCase(),
  }
  const dateMatches = (auction: Auction) => {
    if (!filters.date) return true
    const start = auction.startAt?.slice(0, 10)
    const end = auction.endAt?.slice(0, 10)
    if (!start || !end) return false
    return start <= filters.date.to && end >= filters.date.from
  }
  const filteredAuctions = state.auctions.filter((auction) =>
    auction.title.toLocaleLowerCase().includes(normalizedFilters.name) &&
    auction.location.toLocaleLowerCase().includes(normalizedFilters.location) &&
    dateMatches(auction),
  )
  const hasFilters = Boolean(filters.name.trim() || filters.location.trim() || filters.date)
  const clearFilters = () => setFilters({ name: '', location: '', date: null })
  const pendingAuction = pendingStatusAction
    ? state.auctions.find((auction) => auction.id === pendingStatusAction.auctionId) ?? null
    : null

  return (
    <section className={cn(panel, 'overflow-hidden')}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <h1 className="font-display text-xl font-bold text-foreground">Subastas</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Filtros"
            aria-expanded={filtersOpen}
            aria-controls="auction-filters"
            onClick={() => setFiltersOpen((open) => !open)}
            className={filterTriggerClass(filtersOpen || hasFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
          {formOpen ? null : (
            <button
              type="button"
              onClick={() => {
                setSuggestAddLots(false)
                setError(null)
                setFormOpen(true)
              }}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          )}
        </div>
      </div>
      {formOpen ? <AuctionCreateForm error={error} onCreate={createAndSuggest} onClose={() => { setFormOpen(false); setError(null) }} /> : null}
      {suggestAddLots && state.auctions.length > 0 ? (
        <div className="flex flex-col gap-3 border-b border-border bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Subasta creada</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Ahora puedes agregar los lotes que se ofrecerán.</p>
          </div>
          <Link
            href={`/admin/subastas/${state.auctions[state.auctions.length - 1].id}/lotes`}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
          >
            Agregar lotes
          </Link>
        </div>
      ) : null}
      <AuctionAdminFilters filters={filters} onChange={setFilters} open={filtersOpen} hasFilters={hasFilters} onClear={clearFilters} />
      {pendingAuction && pendingStatusAction ? (
        <StatusActionConfirmation
          auctionTitle={pendingAuction.title}
          startAt={pendingAuction.startAt}
          error={statusActionError}
          onCancel={() => { setPendingStatusAction(null); setStatusActionError(null) }}
          onConfirm={() => confirmStatusAction(pendingAuction, pendingStatusAction.status)}
        />
      ) : null}
      <ul>
        {filteredAuctions.map((auction) => (
          <AuctionAdminRow
            key={auction.id}
            auction={auction}
            pendingDelete={pendingId === auction.id}
            onConfirmDelete={() => { setPendingId(null); setError(deleteAuction(auction.id)) }}
            onCancelDelete={() => setPendingId(null)}
            onRequestDelete={() => setPendingId(auction.id)}
            onStatusAction={(status) => { setStatusActionError(null); setPendingStatusAction({ auctionId: auction.id, status }) }}
          />
        ))}
      </ul>
      {filteredAuctions.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">No hay subastas con esos filtros.</p>
          {hasFilters ? <button type="button" onClick={clearFilters} className="mt-3 min-h-11 rounded-xl px-4 text-sm font-semibold text-primary hover:bg-accent">Limpiar filtros</button> : null}
        </div>
      ) : null}
    </section>
  )
}
