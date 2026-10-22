'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import type { Client } from '@/lib/domain/account'
import { btnPrimary, btnPrimaryMotion, selectField } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function ClientAssociationForm({ clients, onAssociate }: { clients: Client[]; onAssociate: (clientId: string) => string | null }) {
  const [associateOpen, setAssociateOpen] = useState(false)
  function submitAssociation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const message = onAssociate(String(data.get('clientId') ?? ''))
    if (message) return
    form.reset()
    setAssociateOpen(false)
  }

  return (
    <>
      <div className="border-b border-border p-4 lg:hidden">
        <button
          type="button"
          onClick={() => setAssociateOpen(true)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-sm font-semibold text-foreground transition hover:bg-accent"
        >
          Asociar un cliente existente
        </button>
      </div>
      {associateOpen ? (
        <MobileFormModal
          labelledBy="associate-client-heading"
          onClose={() => setAssociateOpen(false)}
          className="max-w-xl"
        >
          <form onSubmit={submitAssociation} className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="associate-client-heading" className="font-display text-lg font-bold text-foreground">Asociar cliente existente</h2>
              <button
                type="button"
                onClick={() => setAssociateOpen(false)}
                aria-label="Cerrar asociación de cliente"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Número y nombre
              <AvailableClientSelect clients={clients} />
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setAssociateOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent">Cancelar</button>
              <button type="submit" className={cn(btnPrimary, btnPrimaryMotion)}>Agregar</button>
            </div>
          </form>
        </MobileFormModal>
      ) : null}
      <form className="hidden border-b border-border p-4 sm:flex-row sm:items-end lg:flex lg:px-5 lg:py-5" onSubmit={submitAssociation}>
        <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-medium text-foreground">
            Asociar un cliente existente
            <AvailableClientSelect clients={clients} />
          </label>
          <button type="submit" className={cn(btnPrimary, btnPrimaryMotion, 'sm:mb-0')}>Agregar</button>
        </div>
      </form>
    </>
  )
}

function AvailableClientSelect({ clients }: { clients: Client[] }) {
  return (
    <select name="clientId" defaultValue="" className={selectField} required>
      <option value="" disabled>Elige número y nombre</option>
      {clients.map((client) => (
        <option key={client.id} value={client.id}>#{client.paddle} {client.name}</option>
      ))}
    </select>
  )
}
