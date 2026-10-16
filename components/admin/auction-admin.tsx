'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ArrowRight, ArrowLeft, RefreshCw, CircleCheck, CircleAlert, SlidersHorizontal } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { DeleteButton } from '@/components/admin/delete-button'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import { auctionSyncService } from '@/lib/application/auction-sync-service'
import {
  auctionStatusActions,
  auctionStatusBadgeColor,
  auctionStatusColor,
  auctionStatusLabel,
  type Auction,
  type AuctionInput,
  type AuctionStatus,
} from '@/lib/domain/auction'
import { btnPrimary, btnPrimaryMotion, eyebrow, field, filterTriggerClass, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { BackLink } from '@/components/layout/back-link'
import { AuctionDateFilter, type DateRange } from '@/components/admin/auction-date-filter'

const empty = {
  title: '',
  location: '',
  seller: '',
  dates: '',
  startAt: '',
  endAt: '',
  status: 'creada' as AuctionStatus,
}

export function AuctionAdminList() {
  const { state, createAuction, updateAuction, deleteAuction } = useSession()
  const [suggestAddLots, setSuggestAddLots] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<{ name: string; location: string; date: DateRange | null }>({ name: '', location: '', date: null })
  const [confirmCreateLeave, setConfirmCreateLeave] = useState(false)
  const [pendingStatusAction, setPendingStatusAction] = useState<{ auctionId: string; status: AuctionStatus } | null>(null)
  const [statusActionError, setStatusActionError] = useState<string | null>(null)
  const {
    draft,
    setDraft,
    pendingId,
    setPendingId,
    error,
    formOpen,
    startCreate,
    reset,
    finishSubmit,
    finishRemove,
  } = useEntityEditor(empty)

  const hasUnsavedNewAuction = formOpen && Object.keys(empty).some((key) => draft[key as keyof typeof empty] !== empty[key as keyof typeof empty])
  useEffect(() => {
    if (!hasUnsavedNewAuction) return
    const interceptNavigation = (event: Event) => {
      event.preventDefault()
      setConfirmCreateLeave(true)
    }
    window.addEventListener('app:before-navigation', interceptNavigation)
    return () => window.removeEventListener('app:before-navigation', interceptNavigation)
  }, [hasUnsavedNewAuction])

  if (!state) return null

  function submit(event: React.FormEvent) {
    event.preventDefault()
    createAndSuggest(draft)
  }

  function createAndSuggest(input: typeof empty) {
    const message = createAuction(input)
    finishSubmit(message)
    if (!message) setSuggestAddLots(true)
  }

  function requestCreateClose() {
    const changed = Object.keys(empty).some((key) => draft[key as keyof typeof empty] !== empty[key as keyof typeof empty])
    if (changed) setConfirmCreateLeave(true)
    else reset()
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
                startCreate()
              }}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          )}
        </div>
      </div>
      {formOpen ? (
        <MobileFormModal
          labelledBy="auction-form-heading"
          onClose={requestCreateClose}
          className="lg:max-w-none"
        >
        <form
          onSubmit={submit}
          className="mx-auto flex w-full max-w-4xl flex-col gap-5 border-b border-border p-4 pt-2 sm:p-6 sm:pt-2 lg:px-8"
        >
          {confirmCreateLeave ? (
            <section role="alertdialog" aria-label="Confirmar salida" className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
              <p className="font-semibold text-foreground">¿Salir sin guardar?</p>
              <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setConfirmCreateLeave(false)} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-accent">Seguir editando</button>
                <button type="button" onClick={() => { setConfirmCreateLeave(false); reset() }} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">Salir</button>
              </div>
            </section>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={requestCreateClose}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
              <h1 id="auction-form-heading" className="font-display text-xl font-bold text-foreground">Nueva subasta</h1>
            </div>
          </div>
          <AuctionFields draft={draft} onChange={setDraft} />
          {error ? <p className="text-sm font-medium text-primary">{error}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={requestCreateClose}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground sm:min-w-32"
            >
              Cancelar
            </button>
            <button type="submit" className={cn(btnPrimary, btnPrimaryMotion, 'sm:min-w-44')}>
              Crear subasta
            </button>
          </div>
        </form>
        </MobileFormModal>
      ) : null}
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
      <div id="auction-filters" hidden={!filtersOpen} className={cn('gap-2 border-b border-border p-3 sm:grid-cols-3 sm:p-4', filtersOpen ? 'grid' : 'hidden')}>
        <label className="sr-only" htmlFor="auction-filter-name">Filtrar por nombre</label>
        <input
          id="auction-filter-name"
          type="search"
          value={filters.name}
          onChange={(event) => setFilters({ ...filters, name: event.target.value })}
          placeholder="Nombre de subasta"
          className={field}
        />
        <label className="sr-only" htmlFor="auction-filter-location">Filtrar por lugar</label>
        <input
          id="auction-filter-location"
          type="search"
          value={filters.location}
          onChange={(event) => setFilters({ ...filters, location: event.target.value })}
          placeholder="Lugar"
          className={field}
        />
        <AuctionDateFilter value={filters.date} onChange={(date) => setFilters({ ...filters, date })} fieldClassName={cn(field, 'min-h-[42px] pr-10')} />
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-10 justify-self-start rounded-lg px-3 text-sm font-semibold text-primary hover:bg-destructive-soft dark:hover:bg-primary/10 sm:col-span-3"
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>
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
          <li
            key={auction.id}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 border-b border-border px-3 py-2 last:border-b-0 lg:px-2 lg:pt-1 lg:pb-4"
          >
            <div className="col-span-2 min-w-0 px-1 py-2 lg:col-span-1 lg:px-2">
              <span className="block truncate text-sm font-semibold text-foreground lg:text-lg">
                {auction.title}
              </span>
              <span className={cn(eyebrow, 'block text-muted-foreground lg:text-sm')}>
                <span className={cn('font-bold', auctionStatusColor(auction.status))}>{auctionStatusLabel(auction.status)}</span> · {auction.clientIds.length} clientes
              </span>
            </div>
            <Link
              href={`/admin/subastas/${auction.id}`}
              aria-label={`Gestionar subasta ${auction.title}`}
              className="col-start-1 row-start-2 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-xl bg-surface-2 px-2.5 text-sm font-semibold text-foreground ring-1 ring-border transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:ml-2 lg:px-3"
            >
              Gestionar
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
            <div className="col-start-2 row-start-2 flex shrink-0 items-center justify-end gap-1 lg:row-span-2 lg:row-start-1 lg:gap-3 lg:px-1">
              {pendingId === auction.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => finishRemove(auction.id, deleteAuction(auction.id))}
                    className="min-h-11 px-1 text-sm font-semibold text-primary"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingId(null)}
                    className="min-h-11 px-1 text-sm font-semibold text-muted-foreground"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <AuctionStatusActions
                    status={auction.status}
                    compact
                    onAction={(status) => {
                      setStatusActionError(null)
                      setPendingStatusAction({ auctionId: auction.id, status })
                    }}
                  />
                  <span className="ml-auto flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/subastas/${auction.id}/editar`}
                      aria-label="Editar"
                      title="Editar"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton onClick={() => setPendingId(auction.id)} className="h-11 w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </span>
                </>
              )}
            </div>
          </li>
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

export function AuctionEditor({ auction }: { auction: Auction }) {
  const { state, updateAuction, deleteAuction } = useSession()
  const router = useRouter()
  const { draft, setDraft } = useEntityEditor({
    title: auction.title,
    location: auction.location,
    seller: auction.seller ?? '',
    dates: auction.dates,
    startAt: auction.startAt ?? '',
    endAt: auction.endAt ?? '',
    status: auction.status,
  })
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [confirmSync, setConfirmSync] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [pendingStatusAction, setPendingStatusAction] = useState<AuctionStatus | null>(null)
  const [statusActionError, setStatusActionError] = useState<string | null>(null)
  const syncingRef = useRef(false)

  useEffect(() => {
    setLastSyncedAt(auctionSyncService.getLastSyncedAt(auction.id))
  }, [auction.id])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const message = updateAuction(auction.id, draft)
    setError(message)
    if (!message && window.matchMedia('(max-width: 1023px)').matches) router.push('/admin')
  }

  function remove() {
    const message = deleteAuction(auction.id)
    if (message) setError(message)
    else router.push('/admin')
  }

  const hasUnsavedChanges = Object.keys(draft).some((key) =>
    key !== 'status' &&
    draft[key as keyof typeof draft] !== ({
      title: auction.title,
      location: auction.location,
      seller: auction.seller ?? '',
      dates: auction.dates,
      startAt: auction.startAt ?? '',
      endAt: auction.endAt ?? '',
      status: auction.status,
    } as typeof draft)[key as keyof typeof draft],
  )

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const handleInAppNavigation = (event: Event) => {
      event.preventDefault()
      setConfirmLeave(true)
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('app:before-navigation', handleInAppNavigation)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('app:before-navigation', handleInAppNavigation)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  function goBack() {
    if (hasUnsavedChanges) setConfirmLeave(true)
    else router.replace('/admin')
  }

  async function synchronizeAuction() {
    if (syncingRef.current) return
    syncingRef.current = true
    setSyncing(true)
    setConfirmSync(false)
    setSyncMessage(null)
    try {
      const lots = (state?.lots ?? []).filter((lot) => lot.auctionId === auction.id)
      await auctionSyncService.synchronize({ auction: { ...auction, ...draft, status: auction.status }, lots })
      const timestamp = new Date().toISOString()
      auctionSyncService.saveLastSyncedAt(auction.id, timestamp)
      setLastSyncedAt(timestamp)
      setSyncMessage({ type: 'success', text: 'Subasta sincronizada correctamente.' })
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

  function confirmStatusAction() {
    if (!pendingStatusAction) return
    const next = auctionStatusInput(draft, pendingStatusAction)
    const message = updateAuction(auction.id, next)
    setStatusActionError(message)
    if (message) return
    setDraft({
      ...next,
      seller: next.seller ?? '',
      startAt: next.startAt ?? '',
      endAt: next.endAt ?? '',
    })
    setPendingStatusAction(null)
    setStatusActionError(null)
  }

  const lastSyncDate = lastSyncedAt ? new Date(lastSyncedAt) : null
  const formattedLastSync = lastSyncDate && !Number.isNaN(lastSyncDate.getTime())
    ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'short', timeStyle: 'short' }).format(lastSyncDate)
    : null

  return (
    <MobileFormModal labelledBy="auction-editor-heading" onClose={goBack} className="lg:max-w-none">
    <form onSubmit={submit} className={cn(panel, 'mx-auto flex w-full max-w-4xl flex-col gap-5 border-0 bg-transparent p-4 sm:p-6 lg:border lg:bg-surface')}>
      {confirmLeave ? (
        <section role="alertdialog" aria-label="Confirmar salida" className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <p className="font-semibold text-foreground">¿Salir sin guardar?</p>
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setConfirmLeave(false)} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-accent">Seguir editando</button>
            <button type="button" onClick={() => router.replace('/admin')} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">Salir</button>
          </div>
        </section>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <h1 id="auction-editor-heading" className="font-display text-xl font-bold text-foreground">Configuración de subasta</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <AuctionStatusSummary auction={auction} />
          <AuctionStatusActions
            status={auction.status}
            onAction={(status) => { setStatusActionError(null); setPendingStatusAction(status) }}
          />
        </div>
      </div>
      {pendingStatusAction ? (
        <StatusActionConfirmation
          auctionTitle={draft.title}
          startAt={draft.startAt}
          error={statusActionError}
          onCancel={() => { setPendingStatusAction(null); setStatusActionError(null) }}
          onConfirm={confirmStatusAction}
        />
      ) : null}
      <AuctionFields draft={draft} onChange={setDraft} locked={auction.status === 'cerrada'} />
      {error ? <p className="text-sm font-medium text-primary">{error}</p> : null}
      {confirmSync ? (
        <section role="dialog" aria-label="Confirmar sincronización" className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <h2 className="font-semibold text-foreground">¿Sincronizar esta subasta?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Se enviarán los datos de “{draft.title || 'esta subasta'}” al sistema de subasta en vivo.</p>
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setConfirmSync(false)} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-muted-foreground hover:bg-accent">Cancelar</button>
            <button type="button" disabled={syncing} onClick={synchronizeAuction} className={cn(btnPrimary, 'min-h-11 disabled:cursor-wait disabled:opacity-60')}>
              Confirmar sincronización
            </button>
          </div>
        </section>
      ) : null}
      {syncMessage ? (
        <p role="status" aria-live="polite" className={cn('flex items-center gap-2 text-sm font-semibold', syncMessage.type === 'success' ? 'text-success' : 'text-primary')}>
          {syncMessage.type === 'success' ? <CircleCheck className="h-4 w-4 shrink-0" /> : <CircleAlert className="h-4 w-4 shrink-0" />}
          {syncMessage.text}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {pendingDelete ? (
            <>
              <button
                type="button"
                onClick={remove}
                className="rounded-xl bg-destructive-soft px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive-soft dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15"
              >
                Confirmar eliminación
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(false)}
                className="px-3 py-2.5 text-sm font-semibold text-muted-foreground"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setPendingDelete(true)}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-destructive-soft dark:hover:bg-primary/10"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar subasta
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {formattedLastSync ? <p className="text-xs text-muted-foreground">Última sincronización: {formattedLastSync}</p> : <p className="text-xs text-muted-foreground">Aún no se ha sincronizado</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={syncing} onClick={() => { setSyncMessage(null); setConfirmSync(true) }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-accent disabled:cursor-wait disabled:opacity-60">
              <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
              {syncing ? 'Sincronizando…' : 'Sincronizar'}
            </button>
            <button type="submit" className={cn(btnPrimary, btnPrimaryMotion, 'sm:min-w-44')}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </form>
    </MobileFormModal>
  )
}

function AuctionFields({
  draft,
  onChange,
  locked = false,
}: {
  draft: typeof empty
  onChange: (next: typeof empty) => void
  locked?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground md:col-span-2">
        Título
        <input
          value={draft.title}
          onChange={(event) => onChange({ ...draft, title: event.target.value })}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Lugar
        <input
          value={draft.location}
          onChange={(event) => onChange({ ...draft, location: event.target.value })}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Vendedor
        <input
          value={draft.seller ?? ''}
          onChange={(event) => onChange({ ...draft, seller: event.target.value })}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Desde
        <input
          type="datetime-local"
          disabled={locked}
          value={draft.startAt ?? ''}
          onChange={(event) => onChange({ ...draft, startAt: event.target.value })}
          className={cn(field, locked && 'cursor-not-allowed opacity-60')}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Hasta
        <input
          type="datetime-local"
          disabled={locked}
          value={draft.endAt ?? ''}
          onChange={(event) => onChange({ ...draft, endAt: event.target.value })}
          className={cn(field, locked && 'cursor-not-allowed opacity-60')}
        />
      </label>
    </div>
  )
}

function auctionStatusInput(input: Auction | AuctionInput, status: AuctionStatus): AuctionInput {
  return {
    title: input.title,
    location: input.location,
    seller: input.seller ?? '',
    dates: input.dates,
    startAt: input.startAt ?? '',
    endAt: input.endAt ?? '',
    status,
  }
}

function AuctionStatusSummary({ auction }: { auction: Auction }) {
  const at = auction.status === 'cerrada'
    ? auction.closedAt ?? auction.endAt
    : auction.status === 'abierta'
      ? auction.endAt
      : auction.startAt
  const message = auction.status === 'publicada'
    ? `Se abre automáticamente el ${formatAuctionDateTime(at)}`
    : auction.status === 'abierta'
      ? `Se cierra automáticamente el ${formatAuctionDateTime(at)}`
      : auction.status === 'cerrada'
        ? `Subasta cerrada el ${formatAuctionDateTime(at)}`
        : null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn('inline-flex min-h-9 items-center rounded-full px-3 text-xs font-bold', auctionStatusBadgeColor(auction.status))}>
        {auctionStatusLabel(auction.status)}
      </span>
      {message ? <p className="text-sm font-medium text-muted-foreground">{message}</p> : null}
    </div>
  )
}

function formatAuctionDateTime(value?: string) {
  if (!value) return 'fecha pendiente'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'fecha pendiente'
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function StatusActionConfirmation({
  auctionTitle,
  startAt,
  error,
  onCancel,
  onConfirm,
}: {
  auctionTitle: string
  startAt?: string
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <section role="alertdialog" aria-label="Confirmar acción de subasta" className="mx-4 my-3 rounded-2xl border border-primary/25 bg-surface-2 p-4 sm:mx-6 lg:mx-8">
      <h2 className="font-semibold text-foreground">¿Publicar la subasta?</h2>
      <p className="mt-1 text-sm text-muted-foreground">“{auctionTitle}” aparecerá en el catálogo y se abrirá automáticamente el {formatAuctionDateTime(startAt)}.</p>
      {error ? <p role="alert" className="mt-2 text-sm font-semibold text-destructive">{error}</p> : null}
      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-accent">Cancelar</button>
        <button type="button" onClick={onConfirm} className="min-h-11 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-foreground hover:bg-accent">
          Publicar
        </button>
      </div>
    </section>
  )
}

function AuctionStatusActions({
  status,
  onAction,
  compact = false,
}: {
  status: AuctionStatus
  onAction: (status: AuctionStatus) => void
  compact?: boolean
}) {
  const actions = auctionStatusActions(status)
  if (actions.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', compact ? 'justify-start' : 'justify-end')}>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            aria-label={action.label}
            title={action.label}
            onClick={(event) => { event.stopPropagation(); onAction(action.status) }}
            className={cn(
              'inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'border border-border bg-surface text-foreground hover:bg-accent',
              compact && 'px-2 text-xs lg:px-3 lg:text-sm',
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
