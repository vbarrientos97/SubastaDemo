'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import { AuctionFields, emptyAuctionDraft } from '@/components/admin/auction-fields'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { btnPrimary, btnPrimaryMotion } from '@/lib/styles'

export function AuctionCreateForm({ error, onCreate, onClose }: {
  error: string | null
  onCreate: (input: typeof emptyAuctionDraft) => string | null
  onClose: () => void
}) {
  const [draft, setDraft] = useState(emptyAuctionDraft)
  const [confirmCreateLeave, setConfirmCreateLeave] = useState(false)
  const dirty = Object.keys(emptyAuctionDraft).some((key) => draft[key as keyof typeof draft] !== emptyAuctionDraft[key as keyof typeof draft])
  const creationNavigation = useUnsavedChanges(dirty, () => setConfirmCreateLeave(true))

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!onCreate(draft)) onClose()
  }

  function requestCreateClose() {
    if (dirty) setConfirmCreateLeave(true)
    else onClose()
  }

  return (
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
              <button type="button" onClick={() => { creationNavigation.cancelNavigation(); setConfirmCreateLeave(false) }} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-accent">Seguir editando</button>
              <button type="button" onClick={() => { setConfirmCreateLeave(false); onClose(); creationNavigation.discardAndContinue(() => { }) }} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">Salir</button>
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
  )
}
