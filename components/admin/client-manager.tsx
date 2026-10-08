'use client'

import { Link2Off, X } from 'lucide-react'
import { useState } from 'react'
import { MobileFormModal } from '@/components/admin/mobile-form-modal'
import { useSession } from '@/components/auth/session-provider'
import { regionById } from '@/lib/domain/region'
import { btnPrimary, btnPrimaryMotion, eyebrow, panel, selectField } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function ClientManager({ auctionId }: { auctionId: string }) {
  const { state, setAuctionClients } = useSession()
  const [associateOpen, setAssociateOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)

  if (!state) return null
  const auction = state.auctions.find((item) => item.id === auctionId) ?? null
  if (!auction) return <p className="text-sm text-muted-foreground">Esa subasta ya no está.</p>
  const current = auction
  const listed = state.clients.filter((client) => current.clientIds.includes(client.id))
  const available = state.clients.filter((client) => !current.clientIds.includes(client.id))

  function remove(clientId: string) {
    setAuctionClients(
      current.id,
      current.clientIds.filter((id) => id !== clientId),
    )
    setPendingId(null)
  }

  function associate(clientId: string) {
    if (!clientId) return
    setAuctionClients(current.id, [...current.clientIds, clientId])
  }

  function submitAssociation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    associate(String(data.get('clientId') ?? ''))
    form.reset()
    setAssociateOpen(false)
  }

  return (
    <section className={cn(panel, 'overflow-hidden')}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Clientes asociados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Asocia clientes existentes del padrón. El número de cliente corresponde a su paleta.
          </p>
        </div>
      </div>
        {available.length > 0 ? (
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
                    <select name="clientId" defaultValue="" className={selectField} required>
                      <option value="" disabled>Elige número y nombre</option>
                      {available.map((client) => (
                        <option key={client.id} value={client.id}>#{client.paddle} {client.name}</option>
                      ))}
                    </select>
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
                  <select name="clientId" defaultValue="" className={selectField} required>
                    <option value="" disabled>Elige número y nombre</option>
                    {available.map((client) => (
                      <option key={client.id} value={client.id}>#{client.paddle} {client.name}</option>
                    ))}
                  </select>
                </label>
                <button type="submit" className={cn(btnPrimary, btnPrimaryMotion, 'sm:mb-0')}>Agregar</button>
              </div>
            </form>
          </>
        ) : null}
        {listed.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nadie está asociado a esta subasta.</p>
        ) : null}
        <ul>
          {listed.map((client) => (
            <li
              key={client.id}
              className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">{client.name}</span>
                <span className={cn(eyebrow, 'text-muted-foreground')}>
                  #{client.paddle} · {regionById(client.regionId).name}
                </span>
              </span>
              <span className="flex shrink-0 items-center justify-end gap-2">
                {pendingId === client.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => remove(client.id)}
                      className="text-sm font-semibold text-primary"
                    >
                      Desasociar
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
                  <button
                    type="button"
                    onClick={() => setPendingId(client.id)}
                    aria-label="Desasociar de esta subasta"
                    title="Desasociar de esta subasta"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-500/10 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Link2Off className="h-4 w-4" />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
    </section>
  )
}
