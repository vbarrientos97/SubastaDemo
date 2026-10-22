'use client'

import { useState } from 'react'
import { Trash2, RefreshCw, CircleCheck, CircleAlert } from 'lucide-react'
import type { Auction, AuctionInput } from '@/lib/domain/auction'
import type { Lot } from '@/lib/domain/lot'
import { useAuctionSync } from '@/components/admin/use-auction-sync'
import { btnPrimary, btnPrimaryMotion } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function AuctionEditorActions({ auction, draft, lots, onRemove }: {
  auction: Auction
  draft: AuctionInput
  lots: Lot[]
  onRemove: () => void
}) {
  const [pendingDelete, setPendingDelete] = useState(false)
  const { confirmSync, syncing, syncMessage, formattedLastSync, requestSync, cancelSync, synchronizeAuction } = useAuctionSync(auction, draft, lots)
  return (
    <>
      {confirmSync ? (
        <section role="dialog" aria-label="Confirmar sincronización" className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <h2 className="font-semibold text-foreground">¿Simular la sincronización de esta subasta?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Se registrará la simulación de “{draft.title || 'esta subasta'}” en este navegador. No se enviarán datos a un sistema externo.</p>
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={cancelSync} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-muted-foreground hover:bg-accent">Cancelar</button>
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
                onClick={onRemove}
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
            <button type="button" disabled={syncing} onClick={requestSync} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-accent disabled:cursor-wait disabled:opacity-60">
              <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
              {syncing ? 'Sincronizando…' : 'Sincronizar'}
            </button>
            <button type="submit" className={cn(btnPrimary, btnPrimaryMotion, 'sm:min-w-44')}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
