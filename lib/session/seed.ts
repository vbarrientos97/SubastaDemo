import { lots as catalogLots, auction } from '@/lib/data/auction'
import type { Client } from '@/lib/domain/account'
import { OPEN_AUCTION_ID, type Auction } from '@/lib/domain/auction'
import type { AuctionEvent } from '@/lib/domain/event'
import type { Lot, LotCategory } from '@/lib/domain/lot'
import type { RegionId } from '@/lib/domain/region'
import type { SessionState } from '@/lib/application/session-repository'

const buyers: { id: string; name: string; paddle: string; regionId: RegionId }[] = [
  { id: 'patrocinio', name: 'Patrocinio Romero', paddle: '11', regionId: 'boqueron' },
  { id: 'omar', name: 'Omar Rodríguez', paddle: '12', regionId: 'boqueron' },
  { id: 'antonio', name: 'Antonio Aguirre', paddle: '13', regionId: 'boqueron' },
  { id: 'evin', name: 'Evin Aranda', paddle: '14', regionId: 'boqueron' },
  { id: 'carlos-santiago', name: 'Carlos Santiago', paddle: '42', regionId: 'boqueron' },
  { id: 'chan', name: 'Chan Méndez', paddle: '21', regionId: 'torti' },
  { id: 'manuel', name: 'Manuel Jaén', paddle: '22', regionId: 'torti' },
  { id: 'bb', name: 'BB', paddle: '23', regionId: 'torti' },
  { id: 'felipe', name: 'Felipe II Vargas', paddle: '24', regionId: 'torti' },
  { id: 'ruben', name: 'Rubén Quintana', paddle: '31', regionId: 'azuero' },
  { id: 'vicente', name: 'Vicente García', paddle: '32', regionId: 'azuero' },
  { id: 'carlos-moreno', name: 'Carlos Moreno', paddle: '33', regionId: 'azuero' },
  { id: 'cristobal', name: 'Cristóbal Coronel', paddle: '34', regionId: 'azuero' },
]

const sales: [number, number, string, LotCategory][] = [
  [13, 2400, 'patrocinio', 'hembra'],
  [14, 2100, 'chan', 'macho'],
  [15, 2100, 'chan', 'macho'],
  [16, 2100, 'chan', 'macho'],
  [17, 2200, 'patrocinio', 'macho'],
  [18, 2200, 'patrocinio', 'macho'],
  [19, 2200, 'patrocinio', 'macho'],
  [20, 2200, 'felipe', 'macho'],
  [21, 3000, 'bb', 'macho'],
  [22, 1200, 'patrocinio', 'macho'],
  [23, 1800, 'patrocinio', 'hembra'],
  [24, 2000, 'omar', 'hembra'],
  [25, 1600, 'omar', 'hembra'],
  [26, 1600, 'manuel', 'hembra'],
  [27, 1600, 'omar', 'hembra'],
  [28, 1400, 'patrocinio', 'hembra'],
  [29, 1700, 'patrocinio', 'hembra'],
  [30, 2000, 'cristobal', 'hembra'],
  [31, 1600, 'patrocinio', 'hembra'],
  [32, 1700, 'patrocinio', 'hembra'],
  [33, 1700, 'evin', 'hembra'],
  [34, 1700, 'patrocinio', 'hembra'],
  [35, 1800, 'omar', 'hembra'],
  [36, 1600, 'patrocinio', 'hembra'],
  [37, 1600, 'patrocinio', 'macho'],
  [38, 1600, 'patrocinio', 'macho'],
  [40, 2900, 'vicente', 'macho'],
  [41, 3500, 'carlos-moreno', 'macho'],
]

function boardLot(order: number, price: number, clientId: string, category: LotCategory): Lot {
  const client = buyers.find((buyer) => buyer.id === clientId)
  return {
    id: `pizarra-${order}`,
    order,
    title: `Lote ${order}`,
    registeredName: client?.name ?? `Lote ${order}`,
    category,
    status: 'closed',
    image: '/placeholder.svg',
    headCount: 1,
    weightKg: 0,
    pricePerKg: 0,
    currentBid: price,
    minIncrement: 50,
    secondsLeft: null,
    breed: 'Cebú',
    auctionId: OPEN_AUCTION_ID,
    finalPrice: price,
    soldToPaddle: client ? Number(client.paddle) : undefined,
    winnerClientId: clientId,
    inCatalog: false,
  }
}

function demoEvents(): AuctionEvent[] {
  const now = Date.now()
  const day = 24 * 3600 * 1000
  return [
    {
      id: 'evento-abierta',
      typeId: 'live_remate',
      title: 'Subasta Especial Carlos Santiago',
      description: 'Remate en vivo en Subasta David, Chiriquí.',
      startsAt: new Date(now - 2 * day).toISOString(),
      endsAt: new Date(now + 1 * day).toISOString(),
      href: '/',
    },
    {
      id: 'evento-proxima',
      typeId: 'auction',
      title: 'Subasta de Reemplazo Brangus',
      description: 'Próxima jornada con terneros y vaquillas élite.',
      startsAt: new Date(now + 7 * day).toISOString(),
      endsAt: new Date(now + 8 * day).toISOString(),
      href: '/?tab=proxima',
      lotId: 'lote-04',
    },
    {
      id: 'evento-rifa',
      typeId: 'raffle',
      title: 'Rifa solidaria de novilla',
      description: 'Beneficio a favor de la asociación de criadores.',
      startsAt: new Date(now + 14 * day).toISOString(),
    },
    {
      id: 'evento-otro',
      typeId: 'other',
      title: 'Jornada de tipificación',
      description: 'Capacitación abierta al público.',
      startsAt: new Date(now + 21 * day).toISOString(),
    },
  ]
}

export function createSeed(): SessionState {
  const floor: Lot[] = catalogLots.map((lot) => {
    if (lot.id === 'lote-03') return { ...lot, winnerClientId: 'carlos-santiago' }
    if (lot.id === 'lote-02') {
      const bids = lot.bids ?? []
      return {
        ...lot,
        leader: 'Otro pujador',
        leaderClientId: 'demo-competidor',
        bids: [
          ...(bids[0] ? [bids[0]] : []),
          { bidder: 'Carlos Santiago', bidderClientId: 'carlos-santiago', amount: 2350, date: '20/9/2025', time: '3:10 PM' },
          ...bids.slice(2),
        ],
      }
    }
    if (lot.id === 'lote-05') {
      const bids = lot.bids ?? []
      return {
        ...lot,
        leader: 'Carlos Santiago',
        leaderClientId: 'carlos-santiago',
        bids: [
          { bidder: 'Carlos Santiago', bidderClientId: 'carlos-santiago', amount: lot.currentBid, date: '20/9/2025', time: '4:12 PM' },
          ...bids.slice(1),
        ],
      }
    }
    return lot
  })
  const clients: Client[] = buyers.map(({ id, name, paddle, regionId }) => ({
    id,
    name,
    paddle,
    regionId,
  }))

  return {
    currentUserId: null,
    accounts: [
      {
        id: 'acc-admin',
        role: 'admin',
        username: 'admin',
        email: 'admin@subasta.pa',
        password: 'admin',
      },
      {
        id: 'acc-carlos',
        role: 'buyer',
        username: 'carlos',
        email: 'carlos@subasta.pa',
        password: 'carlos',
        clientId: 'carlos-santiago',
      },
      {
        id: 'acc-omar',
        role: 'buyer',
        username: 'omar',
        email: 'omar@subasta.pa',
        password: 'omar',
        clientId: 'omar',
      },
    ],
    auctions: demoAuctions(floor.length),
    lots: [
      ...floor.map((lot) => ({
        ...lot,
        auctionId: lot.status === 'upcoming' ? 'subasta-brangus' : lot.auctionId || OPEN_AUCTION_ID,
      })),
      ...sales.map(([order, price, clientId, category]) => boardLot(order, price, clientId, category)),
      closedLot('lote-enero-1', 1, 'Novillo de ceba', 'macho', 'patrocinio'),
      closedLot('lote-enero-2', 2, 'Novilla cerrada', 'hembra', 'omar'),
    ],
    clients,
    favoriteLotIds: [],
    events: demoEvents(),
    pendingFavoriteLotId: null,
    schemaVersion: 4,
  }
}

function demoAuctions(openLots: number): Auction[] {
  return [
    {
      id: OPEN_AUCTION_ID,
      status: 'abierta',
      title: auction.title,
      location: auction.location,
      focus: auction.focus,
      closeLabel: auction.closeLabel,
      dates: '19 y 20 de septiembre',
      totalLots: openLots,
      connected: auction.connected,
      clientIds: ['carlos-santiago'],
    },
    {
      id: 'subasta-brangus',
      status: 'publicada',
      title: 'Subasta de Reemplazo Brangus',
      location: 'Santiago, Veraguas',
      focus: 'Reemplazo',
      closeLabel: 'Aún no abre',
      dates: 'Próximamente',
      totalLots: 2,
      connected: 0,
      clientIds: ['carlos-santiago'],
    },
    {
      id: 'subasta-cerrada',
      status: 'cerrada',
      title: 'Remate de enero',
      location: 'Chitré',
      focus: 'Ceba',
      closeLabel: 'Cerrada',
      dates: '12 de enero',
      totalLots: 2,
      connected: 0,
      clientIds: [],
    },
    {
      id: 'subasta-borrador',
      status: 'creada',
      title: 'Borrador de abril',
      location: '',
      focus: '',
      closeLabel: '',
      dates: '',
      totalLots: 0,
      connected: 0,
      clientIds: [],
    },
  ]
}

function closedLot(
  id: string,
  order: number,
  title: string,
  category: LotCategory,
  winnerClientId: string,
): Lot {
  return {
    id,
    order,
    title,
    registeredName: title,
    category,
    status: 'closed',
    image: '/placeholder.svg',
    headCount: 1,
    weightKg: 400,
    pricePerKg: 0,
    currentBid: 1500,
    minIncrement: 50,
    secondsLeft: null,
    breed: 'Cebú',
    auctionId: 'subasta-cerrada',
    seller: 'Ganadera Sur',
    color: 'Colorado',
    finalPrice: 1500,
    winnerClientId,
    inCatalog: true,
  }
}
