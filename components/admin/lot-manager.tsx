'use client'

import { ArrowLeft, ChevronDown, Pencil, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DeleteButton } from '@/components/admin/delete-button'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import { useSession } from '@/components/auth/session-provider'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { displayedPrice, formatLotBirthDate, lotBirthDateInputValue, LOT_COLORS, statusLabel, type Lot, type LotCategory, type LotColor, type LotStatus } from '@/lib/domain/lot'
import { btnPrimary, btnPrimaryMotion, eyebrow, field, panel, selectField } from '@/lib/styles'
import { cn } from '@/lib/utils'

const empty = {
  breed: '',
  category: 'macho' as LotCategory,
  price: '',
  status: 'upcoming' as LotStatus,
  seller: '',
  color: '' as LotColor | '',
  birthDate: '',
  sire: '',
  dam: '',
  youtubeUrl: '',
  image1: '',
  image2: '',
  image3: '',
  image4: '',
}

export function LotManager({ auctionId }: { auctionId: string }) {
  const { state, createLot, updateLot, deleteLot } = useSession()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [colorFilter, setColorFilter] = useState<LotColor | 'todos'>('todos')
  const [initialDraft, setInitialDraft] = useState(JSON.stringify(empty))
  const {
    draft,
    setDraft,
    editingId,
    pendingId,
    setPendingId,
    error,
    formOpen,
    beginEdit,
    startCreate,
    reset,
    finishSubmit,
    finishRemove,
  } = useEntityEditor(empty)

  const hasUnsavedDraft = formOpen && JSON.stringify(draft) !== initialDraft
  useEffect(() => {
    if (!hasUnsavedDraft) return
    const interceptNavigation = (event: Event) => {
      event.preventDefault()
      setConfirmLeave(true)
    }
    window.addEventListener('app:before-navigation', interceptNavigation)
    return () => window.removeEventListener('app:before-navigation', interceptNavigation)
  }, [hasUnsavedDraft])

  if (!state) return null
  const lots = state.lots.filter((lot) => lot.auctionId === auctionId).slice().sort((a, b) => a.order - b.order)
  const visibleLots = colorFilter === 'todos' ? lots : lots.filter((lot) => lot.color === colorFilter)
  const nextLotOrder = lots.reduce((max, lot) => Math.max(max, lot.order), 0) + 1

  function edit(lot: Lot) {
    const photos = lot.images ?? [lot.image]
    setSuccessMessage(null)
    setDetailsOpen(true)
    const nextDraft = {
      breed: lot.breed,
      category: lot.category,
      price: String(displayedPrice(lot)),
      status: lot.status,
      seller: lot.seller ?? '',
      color: (lot.color ?? '') as LotColor | '',
      birthDate: lotBirthDateInputValue(lot.birthDate),
      sire: lot.sire ?? '',
      dam: lot.dam ?? '',
      youtubeUrl: lot.youtubeUrl ?? '',
      image1: photos[0] ?? '',
      image2: photos[1] ?? '',
      image3: photos[2] ?? '',
      image4: photos[3] ?? '',
    }
    setInitialDraft(JSON.stringify(nextDraft))
    beginEdit(lot.id, nextDraft)
  }

  function startNewLot() {
    const nextDraft = { ...empty }
    setInitialDraft(JSON.stringify(nextDraft))
    setSuccessMessage(null)
    setDetailsOpen(false)
    startCreate()
    setDraft(nextDraft)
  }

  function requestClose() {
    if (JSON.stringify(draft) !== initialDraft) setConfirmLeave(true)
    else reset()
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const addAnother = !editingId && submitter?.value === 'add-another'
    const input = {
      title: draft.breed,
      breed: draft.breed,
      category: draft.category,
      price: Number(draft.price),
      status: editingId ? draft.status : 'upcoming',
      seller: draft.seller,
      color: draft.color,
      birthDate: draft.birthDate,
      sire: draft.sire,
      dam: draft.dam,
      youtubeUrl: draft.youtubeUrl,
      images: [draft.image1, draft.image2, draft.image3, draft.image4],
    }
    const message = editingId ? updateLot(editingId, input) : createLot(auctionId, input)
    finishSubmit(message)
    if (!message) {
      if (addAnother) {
        startCreate()
        setDraft({ ...empty, seller: draft.seller })
        setDetailsOpen(false)
        setSuccessMessage(`Lote ${nextLotOrder} agregado · Siguiente: ${nextLotOrder + 1}`)
      } else {
        setSuccessMessage(editingId ? 'Cambios guardados.' : `Lote ${nextLotOrder} agregado.`)
      }
    }
  }

  function remove(lot: Lot) {
    finishRemove(lot.id, deleteLot(lot.id))
  }

  return (
    <section className={cn(panel, 'overflow-hidden')}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <h1 className="font-display text-xl font-bold text-foreground">Lotes</h1>
        {formOpen ? null : (
          <button
            type="button"
            onClick={startNewLot}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <label htmlFor="admin-lot-color-filter" className="text-sm font-semibold text-foreground">Filtrar por color</label>
        <select id="admin-lot-color-filter" value={colorFilter} onChange={(event) => setColorFilter(event.target.value as LotColor | 'todos')} className={selectField + ' max-w-xs'}>
          <option value="todos">Todos</option>
          {LOT_COLORS.map((color) => <option key={color} value={color}>{color}</option>)}
        </select>
      </div>
      {formOpen ? (
        <MobileFormModal labelledBy="lot-form-heading" onClose={requestClose} className="max-w-xl">
        <form onSubmit={submit} className="flex min-w-0 flex-col gap-4 border-b border-border p-4 sm:p-5">
          {confirmLeave ? (
            <section role="alertdialog" aria-label="Confirmar salida" className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
              <p className="font-semibold text-foreground">¿Salir sin guardar?</p>
              <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setConfirmLeave(false)} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-accent">Seguir editando</button>
                <button type="button" onClick={() => { setConfirmLeave(false); reset() }} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">Salir</button>
              </div>
            </section>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p id="lot-form-heading" className={cn(eyebrow, 'text-primary')}>{editingId ? 'Editar lote' : `Nuevo lote · #${nextLotOrder}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">El estado se asigna automáticamente.</p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              aria-label={editingId ? 'Cancelar edición' : 'Cerrar formulario de lote'}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </button>
          </div>

          {successMessage && !editingId ? (
            <p role="status" className="rounded-xl bg-success/10 px-3 py-2.5 text-sm font-medium text-success">
              {successMessage}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Raza
              <input value={draft.breed} onChange={(event) => setDraft({ ...draft, breed: event.target.value })} className={field} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Color
              <select value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value as LotColor | '' })} className={selectField} required>
                <option value="">Elige un color</option>
                {LOT_COLORS.map((color) => <option key={color} value={color}>{color}</option>)}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Nacimiento
              <input type="date" value={draft.birthDate} onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })} className={field} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Vendedor
              <input value={draft.seller} onChange={(event) => setDraft({ ...draft, seller: event.target.value })} className={field} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Sexo
              <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as LotCategory })} className={selectField}>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Precio
              <input inputMode="numeric" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} className={field} />
            </label>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
              className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              <span>Datos adicionales</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', detailsOpen && 'rotate-180')} />
            </button>
            {detailsOpen ? (
              <div className="grid grid-cols-1 gap-3 border-t border-border p-3 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
                  Padre
                  <input value={draft.sire} onChange={(event) => setDraft({ ...draft, sire: event.target.value })} className={field} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
                  Madre
                  <input value={draft.dam} onChange={(event) => setDraft({ ...draft, dam: event.target.value })} className={field} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
                  YouTube
                  <input value={draft.youtubeUrl} onChange={(event) => setDraft({ ...draft, youtubeUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=…" className={field} />
                </label>
                {(['image1', 'image2', 'image3', 'image4'] as const).map((key, index) => (
                  <label key={key} className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
                    {index === 3 ? 'Foto 4 · Certificado (opcional)' : `Foto ${index + 1} (opcional)`}
                    <input value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} placeholder="Opcional · /cattle/… o https://" className={field} />
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm font-medium text-primary">{error}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {editingId ? (
              <button type="submit" value="finish" className={cn(btnPrimary, btnPrimaryMotion, 'sm:min-w-40')}>
                Guardar cambios
              </button>
            ) : (
              <>
                <button type="submit" value="finish" className="rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground sm:order-1">
                  Guardar lote
                </button>
                <button type="submit" value="add-another" className={cn(btnPrimary, btnPrimaryMotion, 'sm:min-w-52')}>
                  Guardar y agregar otro
                </button>
              </>
            )}
          </div>
        </form>
        </MobileFormModal>
      ) : null}
      {successMessage && !formOpen ? (
        <p role="status" className="border-b border-border bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {successMessage}
        </p>
      ) : null}
        <ul>
          {visibleLots.map((lot) => (
            <li
              key={lot.id}
              className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 md:grid md:grid-cols-[minmax(0,1fr)_7rem_6rem_8rem_auto] md:items-center md:gap-4"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  Lote {lot.order} · {lot.breed}
                </span>
                <span className="block text-sm text-muted-foreground md:hidden">
                  Color: {lot.color ?? '—'} · Nacimiento: {formatLotBirthDate(lot.birthDate)} · {statusLabel(lot.status)}
                </span>
              </span>
              <span className="hidden min-w-0 text-sm text-foreground md:block">
                <span className={cn(eyebrow, 'block text-muted-foreground')}>Color</span>
                {lot.color ?? '—'}
              </span>
              <span className="hidden min-w-0 text-sm text-muted-foreground md:block">{statusLabel(lot.status)}</span>
              <span className="hidden min-w-0 text-sm text-foreground md:block">
                <span className={cn(eyebrow, 'block text-muted-foreground')}>Nacimiento</span>
                {formatLotBirthDate(lot.birthDate)}
              </span>
              <span className="flex shrink-0 items-center justify-end gap-2 md:justify-self-end">
                {pendingId === lot.id ? (
                  <>
                    <button type="button" onClick={() => remove(lot)} className="text-sm font-semibold text-primary">
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
                    <button
                      type="button"
                      onClick={() => edit(lot)}
                      aria-label={`Editar lote ${lot.order}`}
                      title="Editar lote"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-foreground transition hover:bg-accent"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <DeleteButton onClick={() => setPendingId(lot.id)} />
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
    </section>
  )
}
