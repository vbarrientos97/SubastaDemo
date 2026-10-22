'use client'

import { Pencil } from 'lucide-react'
import { DeleteButton } from '@/components/admin/delete-button'
import { formatLotBirthDate, statusLabel, type Lot } from '@/lib/domain/lot'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function LotAdminRow({ lot, pendingDelete, onConfirmDelete, onCancelDelete, onEdit, onRequestDelete }: {
  lot: Lot
  pendingDelete: boolean
  onConfirmDelete: () => void
  onCancelDelete: () => void
  onEdit: () => void
  onRequestDelete: () => void
}) {
  return (
    <li
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
        {pendingDelete ? (
          <>
            <button type="button" onClick={onConfirmDelete} className="text-sm font-semibold text-primary">
              Confirmar
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="text-sm font-semibold text-muted-foreground"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Editar lote ${lot.order}`}
              title="Editar lote"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-foreground transition hover:bg-accent"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <DeleteButton onClick={onRequestDelete} />
          </>
        )}
      </span>
    </li>
  )
}
