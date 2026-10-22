'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { LotAdminRow } from '@/components/admin/lot-admin-row'
import { emptyLotDraft, lotDraftFromLot, lotInputFromDraft } from '@/components/admin/lot-fields'
import { LotEditorForm } from '@/components/admin/lot-editor-form'
import { useSession } from '@/components/auth/session-provider'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { LOT_COLORS, type Lot, type LotColor } from '@/lib/domain/lot'
import { panel, selectField } from '@/lib/styles'
import { cn } from '@/lib/utils'

const empty = emptyLotDraft

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
  const navigation = useUnsavedChanges(hasUnsavedDraft, () => setConfirmLeave(true))

  if (!state) return null
  const lots = state.lots.filter((lot) => lot.auctionId === auctionId).slice().sort((a, b) => a.order - b.order)
  const visibleLots = colorFilter === 'todos' ? lots : lots.filter((lot) => lot.color === colorFilter)
  const nextLotOrder = lots.reduce((max, lot) => Math.max(max, lot.order), 0) + 1

  function edit(lot: Lot) {
    setSuccessMessage(null)
    setDetailsOpen(true)
    const nextDraft = lotDraftFromLot(lot)
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
    const input = lotInputFromDraft(draft, !!editingId)
    const message = editingId ? updateLot(editingId, input) : createLot(auctionId, input)
    finishSubmit(message)
    if (!message) {
      if (addAnother) {
        startCreate()
        setDraft({ ...empty, seller: draft.seller })
        setInitialDraft(JSON.stringify({ ...empty, seller: draft.seller }))
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
        <LotEditorForm
          draft={draft} onChange={setDraft} editingId={editingId} nextLotOrder={nextLotOrder}
          successMessage={successMessage} error={error} detailsOpen={detailsOpen}
          onToggleDetails={() => setDetailsOpen((open) => !open)} onSubmit={submit} onClose={requestClose}
        >
          {confirmLeave ? (
            <section role="alertdialog" aria-label="Confirmar salida" className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
              <p className="font-semibold text-foreground">¿Salir sin guardar?</p>
              <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { navigation.cancelNavigation(); setConfirmLeave(false) }} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-accent">Seguir editando</button>
                <button type="button" onClick={() => { setConfirmLeave(false); reset(); navigation.discardAndContinue(() => { }) }} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">Salir</button>
              </div>
            </section>
          ) : null}
        </LotEditorForm>
      ) : null}
      {successMessage && !formOpen ? (
        <p role="status" className="border-b border-border bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {successMessage}
        </p>
      ) : null}
      <ul>
        {visibleLots.map((lot) => (
          <LotAdminRow
            key={lot.id}
            lot={lot}
            pendingDelete={pendingId === lot.id}
            onConfirmDelete={() => remove(lot)}
            onCancelDelete={() => setPendingId(null)}
            onEdit={() => edit(lot)}
            onRequestDelete={() => setPendingId(lot.id)}
          />
        ))}
      </ul>
    </section>
  )
}
