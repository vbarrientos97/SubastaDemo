'use client'

import { Link2Off } from 'lucide-react'
import { useState } from 'react'
import { ClientAssociationForm } from '@/components/admin/client-association-form'
import { useSession } from '@/components/auth/session-provider'
import { regionById } from '@/lib/domain/region'
import { eyebrow, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function ClientManager({ auctionId }: { auctionId: string }) {
  const { state, setAuctionClients } = useSession()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!state) return null
  const auction = state.auctions.find((item) => item.id === auctionId) ?? null
  if (!auction) return <p className="text-sm text-muted-foreground">Esa subasta ya no está.</p>
  const current = auction
  const listed = state.clients.filter((client) => current.clientIds.includes(client.id))
  const available = state.clients.filter((client) => !current.clientIds.includes(client.id))

  function remove(clientId: string) {
    const message = setAuctionClients(
      current.id,
      current.clientIds.filter((id) => id !== clientId),
    )
    setError(message)
    if (!message) setPendingId(null)
  }

  function associate(clientId: string) {
    const message = !clientId ? 'Elige un cliente.' : setAuctionClients(current.id, [...current.clientIds, clientId])
    setError(message)
    return message
  }


  return (
    <section className={cn(panel, 'overflow-hidden')}>
      {error ? <p role="alert" className="p-4 text-sm text-destructive">{error}</p> : null}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Clientes asociados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Asocia clientes existentes del padrón. El número de cliente corresponde a su paleta.
          </p>
        </div>
      </div>
      {available.length > 0 ? (
        <ClientAssociationForm clients={available} onAssociate={associate} />
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
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-destructive transition hover:bg-destructive/10 hover:text-destructive dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
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
