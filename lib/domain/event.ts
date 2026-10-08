export type EventTypeId = 'auction' | 'raffle' | 'other' | 'live_remate'

export type AuctionEvent = {
  id: string
  typeId: EventTypeId
  title: string
  description?: string
  /** ISO-8601 UTC */
  startsAt: string
  /** ISO-8601 UTC */
  endsAt?: string
  href?: string
  lotId?: string
}

export type EventInput = {
  typeId: string
  title: string
  description?: string
  startsAt: string
  endsAt?: string
  href?: string
  lotId?: string
}

export type EventTypeConfig = {
  id: EventTypeId
  label: string
}

export const eventTypeRegistry: Record<EventTypeId, EventTypeConfig> = {
  auction: { id: 'auction', label: 'Subasta' },
  raffle: { id: 'raffle', label: 'Rifa' },
  other: { id: 'other', label: 'Otro' },
  live_remate: { id: 'live_remate', label: 'Remate en vivo' },
}

export const eventTypeList = Object.values(eventTypeRegistry)

const knownTypeIds = new Set<string>(Object.keys(eventTypeRegistry))

export function isEventTypeId(value: string): value is EventTypeId {
  return knownTypeIds.has(value)
}

export function eventTypeOf(typeId: string): EventTypeConfig {
  if (isEventTypeId(typeId)) return eventTypeRegistry[typeId]
  return eventTypeRegistry.other
}

export function validateEvent(input: EventInput) {
  if (!input.title.trim()) return 'El evento necesita un título.'
  if (!isEventTypeId(input.typeId)) return 'Elige un tipo de evento.'
  const start = Date.parse(input.startsAt)
  if (!Number.isFinite(start)) return 'La fecha de inicio no es válida.'
  if (input.endsAt) {
    const end = Date.parse(input.endsAt)
    if (!Number.isFinite(end)) return 'La fecha de fin no es válida.'
    if (end < start) return 'La fecha de fin debe ser posterior al inicio.'
  }
  return null
}

export function eventsInMonth(events: AuctionEvent[], year: number, monthIndex: number) {
  return events.filter((event) => {
    const date = new Date(event.startsAt)
    return date.getFullYear() === year && date.getMonth() === monthIndex
  })
}

export function eventsOnDay(events: AuctionEvent[], day: Date) {
  const y = day.getFullYear()
  const m = day.getMonth()
  const d = day.getDate()
  return events.filter((event) => {
    const date = new Date(event.startsAt)
    return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d
  })
}

export function filterEventsByType(events: AuctionEvent[], typeId: string | 'todos') {
  if (typeId === 'todos') return events
  return events.filter((event) => event.typeId === typeId)
}

export function upcomingAuctionEvents(events: AuctionEvent[], now = new Date()) {
  const t = now.getTime()
  return events
    .filter((event) => event.typeId === 'auction' && Date.parse(event.startsAt) >= t)
    .slice()
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}

export function openAuctionEvents(events: AuctionEvent[], now = new Date()) {
  const t = now.getTime()
  return events.filter((event) => {
    if (event.typeId !== 'auction' && event.typeId !== 'live_remate') return false
    const start = Date.parse(event.startsAt)
    const end = event.endsAt ? Date.parse(event.endsAt) : start + 24 * 3600 * 1000
    return start <= t && t <= end
  })
}

export function formatEventWhen(iso: string, timeZone?: string) {
  return new Intl.DateTimeFormat('es-PA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(iso))
}

export function monthMatrix(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const startPad = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, monthIndex, day))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
