'use client'

import type { FormEventHandler, ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import { LotFields, type emptyLotDraft } from '@/components/admin/lot-fields'
import { btnPrimary, btnPrimaryMotion, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function LotEditorForm({ draft, onChange, editingId, nextLotOrder, successMessage, error, detailsOpen, onToggleDetails, onSubmit, onClose, children }: {
  draft: typeof emptyLotDraft
  onChange: (draft: typeof emptyLotDraft) => void
  editingId: string | null
  nextLotOrder: number
  successMessage: string | null
  error: string | null
  detailsOpen: boolean
  onToggleDetails: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onClose: () => void
  children: ReactNode
}) {
  return (
    <MobileFormModal labelledBy="lot-form-heading" onClose={onClose} className="max-w-xl">
      <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-4 border-b border-border p-4 sm:p-5">
        {children}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p id="lot-form-heading" className={cn(eyebrow, 'text-primary')}>{editingId ? 'Editar lote' : `Nuevo lote · #${nextLotOrder}`}</p>
            <p className="mt-1 text-xs text-muted-foreground">El estado se asigna automáticamente.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        <LotFields draft={draft} onChange={onChange} detailsOpen={detailsOpen} onToggleDetails={onToggleDetails} />

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
  )
}
