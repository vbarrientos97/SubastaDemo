'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createClient as saveClient,
  createEvent as saveEvent,
  createAuction as createAuctionCase,
  createLot as saveLot,
  consumePendingFavorite as consumePendingFavoriteCase,
  currentAccount,
  currentClient,
  deleteAuction as deleteAuctionCase,
  deleteClient as deleteClientCase,
  deleteEvent as deleteEventCase,
  deleteLot as deleteLotCase,
  openSession,
  placeBid as placeBidCase,
  registerBuyer,
  setAuctionClients as setAuctionClientsCase,
  savePendingFavorite as savePendingFavoriteCase,
  signIn as signInCase,
  signOut as signOutCase,
  toggleFavorite as toggleFavoriteCase,
  updateAuction as updateAuctionCase,
  updateClient as updateClientCase,
  updateEvent as updateEventCase,
  updateLot as updateLotCase,
} from '@/lib/application/session'
import type { Result, SessionState } from '@/lib/application/session-repository'
import type { ClientInput, RegisterInput, Role } from '@/lib/domain/account'
import type { AuctionInput } from '@/lib/domain/auction'
import type { EventInput } from '@/lib/domain/event'
import { favoriteLots } from '@/lib/domain/favorites'
import { catalogLots, type LotInput } from '@/lib/domain/lot'
import { createLocalStorageSession } from '@/lib/session/local-storage'

type SessionApi = {
  ready: boolean
  state: SessionState | null
  user: ReturnType<typeof currentAccount>
  client: ReturnType<typeof currentClient>
  lots: ReturnType<typeof catalogLots>
  favoriteLotIds: string[]
  favoriteLots: ReturnType<typeof favoriteLots>
  events: NonNullable<SessionState['events']>
  signIn: (login: string, password: string) => { error: string | null; role: Role | null }
  register: (input: RegisterInput) => string | null
  signOut: () => void
  toggleFavorite: (lotId: string) => string | null
  savePendingFavorite: (lotId: string) => string | null
  consumePendingFavorite: () => string | null
  createAuction: (input: AuctionInput) => string | null
  updateAuction: (id: string, input: AuctionInput) => string | null
  deleteAuction: (id: string) => string | null
  setAuctionClients: (id: string, clientIds: string[]) => string | null
  placeBid: (lotId: string, amount: number) => string | null
  createLot: (auctionId: string, input: LotInput) => string | null
  updateLot: (id: string, input: LotInput) => string | null
  deleteLot: (id: string) => string | null
  createClient: (input: ClientInput, auctionId?: string) => string | null
  updateClient: (id: string, input: ClientInput) => string | null
  deleteClient: (id: string) => string | null
  createEvent: (input: EventInput) => string | null
  updateEvent: (id: string, input: EventInput) => string | null
  deleteEvent: (id: string) => string | null
}

const SessionContext = createContext<SessionApi | null>(null)

function apply(result: Result<SessionState>, setState: (state: SessionState) => void) {
  if (!result.ok) return result.error
  setState(result.value)
  return null
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const repo = useMemo(() => createLocalStorageSession(), [])
  const [state, setState] = useState<SessionState | null>(null)

  useEffect(() => {
    setState(openSession(repo))
  }, [repo])

  const api = useMemo<SessionApi>(
    () => ({
      ready: state !== null,
      state,
      user: state ? currentAccount(state) : null,
      client: state ? currentClient(state) : null,
      lots: catalogLots(state?.lots ?? []),
      favoriteLotIds: state?.favoriteLotIds ?? [],
      favoriteLots: favoriteLots(state?.lots ?? [], state?.favoriteLotIds ?? []),
      events: state?.events ?? [],
      signIn(login, password) {
        const result = signInCase(repo, { login, password })
        if (!result.ok) return { error: result.error, role: null }
        const consumed = consumePendingFavoriteCase(repo)
        const next = consumed.ok ? consumed.value : result.value
        setState(next)
        return { error: null, role: currentAccount(next)?.role ?? null }
      },
      register(input) {
        const error = apply(registerBuyer(repo, input), setState)
        if (error) return error
        return apply(consumePendingFavoriteCase(repo), setState)
      },
      signOut() {
        const next = signOutCase(repo)
        if (next) setState(next)
      },
      toggleFavorite(lotId) {
        return apply(toggleFavoriteCase(repo, lotId), setState)
      },
      savePendingFavorite(lotId) {
        return apply(savePendingFavoriteCase(repo, lotId), setState)
      },
      consumePendingFavorite() {
        return apply(consumePendingFavoriteCase(repo), setState)
      },
      createAuction(input) {
        return apply(createAuctionCase(repo, input), setState)
      },
      updateAuction(id, input) {
        return apply(updateAuctionCase(repo, id, input), setState)
      },
      deleteAuction(id) {
        return apply(deleteAuctionCase(repo, id), setState)
      },
      setAuctionClients(id, clientIds) {
        return apply(setAuctionClientsCase(repo, id, clientIds), setState)
      },
      placeBid(lotId, amount) {
        return apply(placeBidCase(repo, lotId, amount), setState)
      },
      createLot(auctionId, input) {
        return apply(saveLot(repo, auctionId, input), setState)
      },
      updateLot(id, input) {
        return apply(updateLotCase(repo, id, input), setState)
      },
      deleteLot(id) {
        return apply(deleteLotCase(repo, id), setState)
      },
      createClient(input, auctionId) {
        return apply(saveClient(repo, input, auctionId), setState)
      },
      updateClient(id, input) {
        return apply(updateClientCase(repo, id, input), setState)
      },
      deleteClient(id) {
        return apply(deleteClientCase(repo, id), setState)
      },
      createEvent(input) {
        return apply(saveEvent(repo, input), setState)
      },
      updateEvent(id, input) {
        return apply(updateEventCase(repo, id, input), setState)
      },
      deleteEvent(id) {
        return apply(deleteEventCase(repo, id), setState)
      },
    }),
    [repo, state],
  )

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession debe usarse dentro de SessionProvider')
  return value
}
