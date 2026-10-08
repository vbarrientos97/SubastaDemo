'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ArrowRight, X, BarChart3 } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { DeleteButton } from '@/components/admin/delete-button'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import {
  auctionStatusActions,
  auctionStatusColor,
  auctionStatusLabel,
  type Auction,
  type AuctionStatus,
} from '@/lib/domain/auction'
import { btnPrimary, btnPrimaryMotion, eyebrow, field, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

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
  const { state, createAuction, deleteAuction } = useSession()
  const [suggestAddLots, setSuggestAddLots] = useState(false)
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

  if (!state) return null

  function submit(event: React.FormEvent) {
    event.preventDefault()
    createAndSuggest(draft)
  }

  function createWithStatus(status: AuctionStatus) {
    createAndSuggest({ ...draft, status })
  }

  function createAndSuggest(input: typeof empty) {
    const message = createAuction(input)
    finishSubmit(message)
    if (!message) setSuggestAddLots(true)
  }

  return (
    <section className={cn(panel, 'overflow-hidden')}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <h1 className="font-display text-xl font-bold text-foreground">Subastas</h1>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin/reportes"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            Reportes
          </Link>
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
        <MobileFormModal labelledBy="auction-form-heading" onClose={reset} className="lg:max-w-none">
        <form
          onSubmit={submit}
          className="mx-auto flex w-full max-w-4xl flex-col gap-5 border-b border-border p-4 sm:p-6 lg:px-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center justify-between gap-3">
              <p id="auction-form-heading" className={cn(eyebrow, 'text-primary')}>Nueva subasta</p>
              <button
                type="button"
                onClick={reset}
                aria-label="Cerrar formulario de subasta"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground sm:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AuctionStatusActions status={draft.status} onAction={createWithStatus} />
          </div>
          <AuctionFields draft={draft} onChange={setDraft} />
          {error ? <p className="text-sm font-medium text-primary">{error}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={reset}
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
      <ul>
        {state.auctions.map((auction) => (
          <li
            key={auction.id}
            className="group flex flex-col gap-2 border-b border-border px-3 py-2 last:border-b-0 lg:flex-row lg:items-center lg:justify-between lg:px-2 lg:py-1"
          >
            <Link
              href={`/admin/subastas/${auction.id}`}
              className="min-w-0 rounded-xl px-1 py-2 transition hover:bg-accent focus-visible:bg-accent lg:flex-1 lg:px-2"
            >
              <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
                {auction.title}
              </span>
              <span className={cn(eyebrow, 'text-muted-foreground')}>
                <span className={cn('font-bold', auctionStatusColor(auction.status))}>{auctionStatusLabel(auction.status)}</span> · {auction.clientIds.length} clientes
              </span>
            </Link>
            <span className="flex w-full shrink-0 items-center justify-between gap-3 px-1 lg:w-auto lg:justify-start">
              {pendingId === auction.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => finishRemove(auction.id, deleteAuction(auction.id))}
                    className="text-sm font-semibold text-primary"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingId(null)}
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/admin/subastas/${auction.id}`}
                    aria-label={`Gestionar subasta ${auction.title}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-surface-2 px-3 text-sm font-semibold text-foreground ring-1 ring-border transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
                  >
                    Gestionar
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </Link>
                  <span className="ml-auto flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/subastas/${auction.id}/editar`}
                      aria-label="Editar"
                      title="Editar"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition hover:bg-accent"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton onClick={() => setPendingId(auction.id)} />
                  </span>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AuctionEditor({ auction }: { auction: Auction }) {
  const { updateAuction, deleteAuction } = useSession()
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

  return (
    <MobileFormModal labelledBy="auction-editor-heading" onClose={() => router.push('/admin')} className="lg:max-w-none">
    <form onSubmit={submit} className={cn(panel, 'mx-auto flex w-full max-w-4xl flex-col gap-5 border-0 bg-transparent p-4 sm:p-6 lg:border lg:bg-surface')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <h1 id="auction-editor-heading" className="font-display text-xl font-bold text-foreground">Configuración de subasta</h1>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            aria-label="Cerrar edición de subasta"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <AuctionStatusActions
          status={draft.status}
          onAction={(status) => {
            const next = { ...draft, status }
            const message = updateAuction(auction.id, next)
            setError(message)
            if (!message) {
              setDraft(next)
              if (window.matchMedia('(max-width: 1023px)').matches) router.push('/admin')
            }
          }}
        />
      </div>
      <AuctionFields draft={draft} onChange={setDraft} />
      {error ? <p className="text-sm font-medium text-primary">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {pendingDelete ? (
            <>
              <button
                type="button"
                onClick={remove}
                className="rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/15"
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
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar subasta
            </button>
          )}
        </div>
        <button type="submit" className={cn(btnPrimary, btnPrimaryMotion, 'sm:min-w-44')}>
          Guardar cambios
        </button>
      </div>
    </form>
    </MobileFormModal>
  )
}

function AuctionFields({
  draft,
  onChange,
}: {
  draft: typeof empty
  onChange: (next: typeof empty) => void
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
          value={draft.startAt ?? ''}
          onChange={(event) => onChange({ ...draft, startAt: event.target.value })}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Hasta
        <input
          type="datetime-local"
          value={draft.endAt ?? ''}
          onChange={(event) => onChange({ ...draft, endAt: event.target.value })}
          className={field}
        />
      </label>
    </div>
  )
}

function AuctionStatusActions({
  status,
  onAction,
}: {
  status: AuctionStatus
  onAction: (status: AuctionStatus) => void
}) {
  const actions = auctionStatusActions(status)

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            onClick={() => onAction(action.status)}
            className={cn(
              'rounded-lg px-3 py-2 text-xs font-bold transition',
              action.primary
                ? 'bg-primary text-primary-foreground hover:brightness-95'
                : 'bg-surface-2 text-foreground hover:bg-accent',
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
