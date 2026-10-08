import {
  matchAccount,
  normalizeLogin,
  normalizePaddle,
  validateClient,
  validateRegistration,
  type ClientInput,
  type RegisterInput,
} from '@/lib/domain/account'
import {
  bidAccess,
  bidDenialMessage,
  isAuctionStatus,
  validateAuctionTransition,
  validateAuction,
  type Auction,
  type AuctionInput,
} from '@/lib/domain/auction'
import {
  isEventTypeId,
  validateEvent,
  type EventInput,
  type EventTypeId,
} from '@/lib/domain/event'
import { addFavoriteId, pruneFavoriteIds, toggleFavoriteId } from '@/lib/domain/favorites'
import { lotImages, validateLot, type LotInput } from '@/lib/domain/lot'
import { isRegionId } from '@/lib/domain/region'
import type { Result, SessionRepository, SessionState } from '@/lib/application/session-repository'

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function mutateSession(
  repo: SessionRepository,
  change: (state: SessionState) => Result<SessionState>,
): Result<SessionState> {
  const state = openSession(repo)
  if (!state) return { ok: false, error: 'No se pudo abrir la sesión.' }
  const result = change(state)
  if (!result.ok) return result
  repo.save(result.value)
  return result
}

function lotCommerce(input: LotInput) {
  const price = Math.round(input.price)
  const closed = input.status === 'closed'
  const onFloor =
    input.status === 'live' || input.status === 'extended' || input.status === 'imminent'
  return { price, closed, onFloor }
}

function eventFields(input: EventInput, typeId: EventTypeId) {
  return {
    typeId,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: input.endsAt ? new Date(input.endsAt).toISOString() : undefined,
    href: input.href?.trim() || undefined,
    lotId: input.lotId?.trim() || undefined,
  }
}

function readEvent(input: EventInput): Result<ReturnType<typeof eventFields>> {
  const error = validateEvent(input)
  if (error || !isEventTypeId(input.typeId)) {
    return { ok: false, error: error ?? 'Elige un tipo de evento.' }
  }
  return { ok: true, value: eventFields(input, input.typeId) }
}

export function openSession(repo: SessionRepository) {
  return repo.load()
}

export function currentAccount(state: SessionState) {
  return state.accounts.find((account) => account.id === state.currentUserId) ?? null
}

export function currentClient(state: SessionState) {
  const account = currentAccount(state)
  if (!account?.clientId) return null
  return state.clients.find((client) => client.id === account.clientId) ?? null
}

export function signIn(
  repo: SessionRepository,
  input: { login: string; password: string },
): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const account = matchAccount(state.accounts, input.login, input.password)
    if (!account) return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    return { ok: true, value: { ...state, currentUserId: account.id } }
  })
}

export function registerBuyer(repo: SessionRepository, input: RegisterInput): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const error = validateRegistration(input, state.accounts, state.clients)
    if (error || !isRegionId(input.regionId)) return { ok: false, error: error ?? 'Elige una región.' }
    const client = {
      id: nextId('cliente'),
      name: input.name.trim(),
      paddle: normalizePaddle(input.paddle),
      regionId: input.regionId,
    }
    const email = normalizeLogin(input.email)
    const account = {
      id: nextId('cuenta'),
      role: 'buyer' as const,
      username: email,
      email,
      password: input.password,
      clientId: client.id,
    }
    return {
      ok: true,
      value: {
        ...state,
        clients: [...state.clients, client],
        accounts: [...state.accounts, account],
        currentUserId: account.id,
      },
    }
  })
}

export function signOut(repo: SessionRepository): SessionState | null {
  const result = mutateSession(repo, (state) => ({
    ok: true,
    value: { ...state, currentUserId: null },
  }))
  return result.ok ? result.value : null
}

function auctionFromInput(id: string, input: AuctionInput, current?: Auction): Auction {
  const dates = input.startAt && input.endAt
    ? `${formatAuctionDateTime(input.startAt)} – ${formatAuctionDateTime(input.endAt)}`
    : input.dates.trim()

  return {
    id,
    status: input.status,
    title: input.title.trim(),
    location: input.location.trim(),
    seller: input.seller?.trim() ?? current?.seller ?? '',
    focus: current?.focus ?? '',
    closeLabel: dates,
    dates,
    startAt: input.startAt || current?.startAt,
    endAt: input.endAt || current?.endAt,
    totalLots: current?.totalLots ?? 0,
    connected: current?.connected ?? 0,
    clientIds: current?.clientIds ?? [],
  }
}

function formatAuctionDateTime(value: string) {
  return new Date(value).toLocaleString('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function readAuction(input: AuctionInput) {
  const error = validateAuction(input)
  if (error || !isAuctionStatus(input.status)) {
    return { ok: false as const, error: error ?? 'Elige un estado.' }
  }
  return { ok: true as const, input }
}

export function createAuction(repo: SessionRepository, input: AuctionInput): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const parsed = readAuction(input)
    if (!parsed.ok) return parsed
    const transitionError = validateAuctionTransition(null, parsed.input.status)
    if (transitionError) return { ok: false, error: transitionError }
    const auction = auctionFromInput(nextId('subasta'), parsed.input)
    return { ok: true, value: { ...state, auctions: [...state.auctions, auction] } }
  })
}

export function updateAuction(
  repo: SessionRepository,
  id: string,
  input: AuctionInput,
): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const current = state.auctions.find((auction) => auction.id === id)
    if (!current) return { ok: false, error: 'Esa subasta ya no está.' }
    const parsed = readAuction(input)
    if (!parsed.ok) return parsed
    const transitionError = validateAuctionTransition(current.status, parsed.input.status)
    if (transitionError) return { ok: false, error: transitionError }
    return {
      ok: true,
      value: {
        ...state,
        auctions: state.auctions.map((auction) =>
          auction.id === id ? auctionFromInput(id, parsed.input, current) : auction,
        ),
      },
    }
  })
}

export function setAuctionClients(
  repo: SessionRepository,
  id: string,
  clientIds: string[],
): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (!state.auctions.some((auction) => auction.id === id)) {
      return { ok: false, error: 'Esa subasta ya no está.' }
    }
    const known = new Set(state.clients.map((client) => client.id))
    const nextIds = clientIds.filter((clientId) => known.has(clientId))
    return {
      ok: true,
      value: {
        ...state,
        auctions: state.auctions.map((auction) =>
          auction.id === id ? { ...auction, clientIds: nextIds } : auction,
        ),
      },
    }
  })
}

export function createClient(
  repo: SessionRepository,
  input: ClientInput,
  auctionId?: string,
): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (auctionId && !state.auctions.some((auction) => auction.id === auctionId)) {
      return { ok: false, error: 'Esa subasta ya no está.' }
    }
    const error = validateClient(input, state.clients)
    if (error || !isRegionId(input.regionId)) return { ok: false, error: error ?? 'Elige una región.' }
    const client = {
      id: nextId('cliente'),
      name: input.name.trim(),
      paddle: normalizePaddle(input.paddle),
      regionId: input.regionId,
    }
    return {
      ok: true,
      value: {
        ...state,
        clients: [...state.clients, client],
        auctions: auctionId
          ? state.auctions.map((auction) =>
              auction.id === auctionId
                ? { ...auction, clientIds: [...auction.clientIds, client.id] }
                : auction,
            )
          : state.auctions,
      },
    }
  })
}

function lotDetails(input: LotInput) {
  const images = lotImages(input)
  return {
    seller: input.seller.trim() || undefined,
    color: input.color.trim() || undefined,
    sire: input.sire.trim() || undefined,
    dam: input.dam.trim() || undefined,
    youtubeUrl: input.youtubeUrl.trim() || undefined,
    images,
    image: images[0] || '/cattle/brahman-bull.png',
  }
}

export function createLot(
  repo: SessionRepository,
  auctionId: string,
  input: LotInput,
): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (!state.auctions.some((auction) => auction.id === auctionId)) {
      return { ok: false, error: 'Esa subasta ya no está.' }
    }
    const error = validateLot(input)
    if (error) return { ok: false, error }
    const { price, closed } = lotCommerce(input)
    const order =
      state.lots
        .filter((lot) => lot.auctionId === auctionId)
        .reduce((max, lot) => Math.max(max, lot.order), 0) + 1
    const lot = {
      id: nextId('lote'),
      auctionId,
      order,
      title: input.title.trim(),
      registeredName: input.title.trim(),
      category: input.category,
      status: input.status,
      headCount: 1,
      weightKg: 0,
      pricePerKg: 0,
      currentBid: price,
      minIncrement: 50,
      secondsLeft: input.status === 'live' || input.status === 'extended' ? 3600 : null,
      breed: input.breed.trim(),
      finalPrice: closed ? price : undefined,
      inCatalog: true,
      ...lotDetails(input),
    }
    return {
      ok: true,
      value: {
        ...state,
        lots: [...state.lots, lot],
        auctions: state.auctions.map((auction) =>
          auction.id === auctionId ? { ...auction, totalLots: auction.totalLots + 1 } : auction,
        ),
      },
    }
  })
}

export function deleteAuction(repo: SessionRepository, id: string): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (!state.auctions.some((auction) => auction.id === id)) {
      return { ok: false, error: 'Esa subasta ya no está.' }
    }
    const lots = state.lots.filter((lot) => lot.auctionId !== id)
    return {
      ok: true,
      value: {
        ...state,
        auctions: state.auctions.filter((auction) => auction.id !== id),
        lots,
        favoriteLotIds: pruneFavoriteIds(state.favoriteLotIds, lots),
      },
    }
  })
}

export function updateClient(
  repo: SessionRepository,
  id: string,
  input: ClientInput,
): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (!state.clients.some((client) => client.id === id)) {
      return { ok: false, error: 'Ese cliente ya no está.' }
    }
    const error = validateClient(input, state.clients, id)
    if (error || !isRegionId(input.regionId)) return { ok: false, error: error ?? 'Elige una región.' }
    const regionId = input.regionId
    return {
      ok: true,
      value: {
        ...state,
        clients: state.clients.map((client) =>
          client.id === id
            ? {
                ...client,
                name: input.name.trim(),
                paddle: normalizePaddle(input.paddle),
                regionId,
              }
            : client,
        ),
      },
    }
  })
}

export function deleteClient(repo: SessionRepository, id: string): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (!state.clients.some((client) => client.id === id)) {
      return { ok: false, error: 'Ese cliente ya no está.' }
    }
    const accounts = state.accounts.filter((account) => account.clientId !== id)
    return {
      ok: true,
      value: {
        ...state,
        clients: state.clients.filter((client) => client.id !== id),
        accounts,
        currentUserId: accounts.some((account) => account.id === state.currentUserId)
          ? state.currentUserId
          : null,
        lots: state.lots.map((lot) =>
          lot.winnerClientId === id ? { ...lot, winnerClientId: undefined } : lot,
        ),
      },
    }
  })
}

export function updateLot(repo: SessionRepository, id: string, input: LotInput): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const current = state.lots.find((lot) => lot.id === id)
    if (!current) return { ok: false, error: 'Ese lote ya no está.' }
    const error = validateLot(input)
    if (error) return { ok: false, error }
    const { price, closed, onFloor } = lotCommerce(input)
    return {
      ok: true,
      value: {
        ...state,
        lots: state.lots.map((lot) =>
          lot.id === id
            ? {
                ...lot,
                title: input.title.trim(),
                registeredName: lot.registeredName === lot.title ? input.title.trim() : lot.registeredName,
                breed: input.breed.trim(),
                category: input.category,
                status: input.status,
                currentBid: price,
                finalPrice: closed ? price : undefined,
                secondsLeft: onFloor ? (lot.secondsLeft ?? 3600) : null,
                ...lotDetails(input),
              }
            : lot,
        ),
      },
    }
  })
}

export function deleteLot(repo: SessionRepository, id: string): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const current = state.lots.find((lot) => lot.id === id)
    if (!current) return { ok: false, error: 'Ese lote ya no está.' }
    const counted = current.inCatalog !== false
    const lots = state.lots.filter((lot) => lot.id !== id)
    return {
      ok: true,
      value: {
        ...state,
        lots,
        favoriteLotIds: pruneFavoriteIds(state.favoriteLotIds, lots),
        events: state.events.map((event) =>
          event.lotId === id ? { ...event, lotId: undefined } : event,
        ),
        auctions: state.auctions.map((auction) =>
          auction.id === current.auctionId
            ? {
                ...auction,
                totalLots: counted ? Math.max(0, auction.totalLots - 1) : auction.totalLots,
              }
            : auction,
        ),
      },
    }
  })
}

export function placeBid(repo: SessionRepository, lotId: string, amount: number): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const lot = state.lots.find((item) => item.id === lotId)
    if (!lot) return { ok: false, error: 'Ese lote ya no está.' }
    const auction = state.auctions.find((item) => item.id === lot.auctionId) ?? null
    const account = currentAccount(state)
    const client = currentClient(state)
    const access = bidAccess(auction, account, client)
    if (!access.ok) return { ok: false, error: bidDenialMessage(access.reason) }
    if (!Number.isFinite(amount) || amount <= lot.currentBid) {
      return { ok: false, error: 'La puja debe superar la oferta actual.' }
    }
    const now = new Date()
    const bidder = client?.name ?? account?.username ?? 'Comprador'
    const bid = {
      bidder,
      bidderClientId: client?.id,
      amount: Math.round(amount),
      date: new Intl.DateTimeFormat('es-PA', { dateStyle: 'short' }).format(now),
      time: new Intl.DateTimeFormat('es-PA', { timeStyle: 'short' }).format(now),
    }
    return {
      ok: true,
      value: {
        ...state,
        lots: state.lots.map((item) =>
          item.id === lotId
          ? {
              ...item,
              currentBid: bid.amount,
              leader: bidder,
              leaderClientId: client?.id,
              bids: [bid, ...(item.bids ?? [])],
            }
            : item,
        ),
      },
    }
  })
}

export function toggleFavorite(repo: SessionRepository, lotId: string): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (!state.currentUserId) return { ok: false, error: 'Debes iniciar sesión.' }
    if (!state.lots.some((lot) => lot.id === lotId)) {
      return { ok: false, error: 'Ese lote ya no está.' }
    }
    return {
      ok: true,
      value: { ...state, favoriteLotIds: toggleFavoriteId(state.favoriteLotIds, lotId) },
    }
  })
}

export function savePendingFavorite(repo: SessionRepository, lotId: string): Result<SessionState> {
  return mutateSession(repo, (state) => ({
    ok: true,
    value: { ...state, pendingFavoriteLotId: lotId },
  }))
}

export function consumePendingFavorite(repo: SessionRepository): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const lotId = state.pendingFavoriteLotId
    if (!lotId || !state.currentUserId) {
      return { ok: true, value: { ...state, pendingFavoriteLotId: null } }
    }
    const exists = state.lots.some((lot) => lot.id === lotId)
    return {
      ok: true,
      value: {
        ...state,
        favoriteLotIds: exists ? addFavoriteId(state.favoriteLotIds, lotId) : state.favoriteLotIds,
        pendingFavoriteLotId: null,
      },
    }
  })
}

export function createEvent(repo: SessionRepository, input: EventInput): Result<SessionState> {
  return mutateSession(repo, (state) => {
    const event = readEvent(input)
    if (!event.ok) return event
    return {
      ok: true,
      value: { ...state, events: [...state.events, { id: nextId('evento'), ...event.value }] },
    }
  })
}

export function updateEvent(
  repo: SessionRepository,
  id: string,
  input: EventInput,
): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (!state.events.some((event) => event.id === id)) {
      return { ok: false, error: 'Ese evento ya no está.' }
    }
    const fields = readEvent(input)
    if (!fields.ok) return fields
    return {
      ok: true,
      value: {
        ...state,
        events: state.events.map((event) =>
          event.id === id ? { ...event, ...fields.value } : event,
        ),
      },
    }
  })
}

export function deleteEvent(repo: SessionRepository, id: string): Result<SessionState> {
  return mutateSession(repo, (state) => {
    if (!state.events.some((event) => event.id === id)) {
      return { ok: false, error: 'Ese evento ya no está.' }
    }
    return { ok: true, value: { ...state, events: state.events.filter((event) => event.id !== id) } }
  })
}
