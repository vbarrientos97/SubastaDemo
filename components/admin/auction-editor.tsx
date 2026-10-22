'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import { AuctionFields } from '@/components/admin/auction-fields'
import { AuctionStatusSummary, AuctionStatusActions, StatusActionConfirmation, auctionStatusInput } from '@/components/admin/auction-status-controls'
import { AuctionEditorActions } from '@/components/admin/auction-editor-actions'
import type { Auction, AuctionStatus } from '@/lib/domain/auction'
import { panel } from '@/lib/styles'

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
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [pendingStatusAction, setPendingStatusAction] = useState<AuctionStatus | null>(null)
  const [statusActionError, setStatusActionError] = useState<string | null>(null)

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

  const editorNavigation = useUnsavedChanges(hasUnsavedChanges, () => setConfirmLeave(true))

  function goBack() {
    if (hasUnsavedChanges) setConfirmLeave(true)
    else router.replace('/admin')
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

  return (
    <MobileFormModal labelledBy="auction-editor-heading" onClose={goBack} className="lg:max-w-none">
      <form onSubmit={submit} className={cn(panel, 'mx-auto flex w-full max-w-4xl flex-col gap-5 border-0 bg-transparent p-4 sm:p-6 lg:border lg:bg-surface')}>
        {confirmLeave ? (
          <section role="alertdialog" aria-label="Confirmar salida" className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
            <p className="font-semibold text-foreground">¿Salir sin guardar?</p>
            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { editorNavigation.cancelNavigation(); setConfirmLeave(false) }} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-accent">Seguir editando</button>
              <button type="button" onClick={() => { setConfirmLeave(false); editorNavigation.discardAndContinue(() => router.replace('/admin')) }} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">Salir</button>
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
        <AuctionEditorActions auction={auction} draft={draft} lots={state?.lots ?? []} onRemove={remove} />
      </form>
    </MobileFormModal>
  )
}
