'use client'

import { ChevronDown, Pencil, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { DeleteButton } from '@/components/admin/delete-button'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import { useSession } from '@/components/auth/session-provider'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { displayedPrice, statusLabel, type Lot, type LotCategory, type LotStatus } from '@/lib/domain/lot'
import { btnPrimary, btnPrimaryMotion, eyebrow, field, panel, selectField } from '@/lib/styles'
import { cn } from '@/lib/utils'

const empty = {
  breed: '',
  category: 'macho' as LotCategory,
  price: '',
  status: 'upcoming' as LotStatus,
  seller: '',
  color: '',
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

  if (!state) return null
  const lots = state.lots.filter((lot) => lot.auctionId === auctionId).slice().sort((a, b) => a.order - b.order)
  const nextLotOrder = lots.reduce((max, lot) => Math.max(max, lot.order), 0) + 1

  function edit(lot: Lot) {
    const photos = lot.images ?? [lot.image]
    setSuccessMessage(null)
    setDetailsOpen(true)
    beginEdit(lot.id, {
      breed: lot.breed,
      category: lot.category,
      price: String(displayedPrice(lot)),
      status: lot.status,
      seller: lot.seller ?? '',
      color: lot.color ?? '',
      sire: lot.sire ?? '',
      dam: lot.dam ?? '',
      youtubeUrl: lot.youtubeUrl ?? '',
      image1: photos[0] ?? '',
      image2: photos[1] ?? '',
      image3: photos[2] ?? '',
      image4: photos[3] ?? '',
    })
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
            onClick={() => {
              setSuccessMessage(null)
              setDetailsOpen(false)
              startCreate()
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        )}
      </div>
      {formOpen ? (
        <MobileFormModal labelledBy="lot-form-heading" onClose={reset} className="max-w-xl">
        <form onSubmit={submit} className="flex min-w-0 flex-col gap-4 border-b border-border p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p id="lot-form-heading" className={cn(eyebrow, 'text-primary')}>{editingId ? 'Editar lote' : `Nuevo lote · #${nextLotOrder}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">El estado se asigna automáticamente.</p>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label={editingId ? 'Cancelar edición' : 'Cerrar formulario de lote'}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancelar</span>
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
                  Color
                  <input value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} className={field} />
                </label>
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
          {lots.map((lot) => (
            <li
              key={lot.id}
              className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  Lote {lot.order} · {lot.breed}
                </span>
                <span className={cn(eyebrow, 'text-muted-foreground')}>
                  {lot.breed} · {statusLabel(lot.status)}
                </span>
              </span>
              <span className="flex shrink-0 items-center justify-end gap-2">
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
