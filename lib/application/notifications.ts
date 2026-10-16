export type DemoNotificationType = 'outbid' | 'closing' | 'won' | 'sold' | 'auction-starting'

export type DemoNotification = {
  id: string
  type: DemoNotificationType
  lotId: string
  lotOrder: number
  createdAt: string
  read: boolean
}

const STORAGE_KEY = 'subasta.notificaciones-demo.v1'
const CHANGE_EVENT = 'subasta:notifications-changed'
const CREATED_EVENT = 'subasta:notification-created'

// Solo datos de demo. No almacenamos nombres, números de cliente, correos ni datos del postor.
// En producción, el servidor debe filtrar y crear estas notificaciones; no basta con ocultar datos en el frontend.
const initialNotifications: DemoNotification[] = [
  { id: 'demo-outbid-02', type: 'outbid', lotId: 'lote-02', lotOrder: 2, createdAt: new Date(Date.now() - 2 * 60_000).toISOString(), read: false },
  { id: 'demo-closing-04', type: 'closing', lotId: 'lote-04', lotOrder: 4, createdAt: new Date(Date.now() - 8 * 60_000).toISOString(), read: false },
  { id: 'demo-won-03', type: 'won', lotId: 'lote-03', lotOrder: 3, createdAt: new Date(Date.now() - 28 * 60_000).toISOString(), read: false },
  { id: 'demo-sold-05', type: 'sold', lotId: 'lote-05', lotOrder: 5, createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(), read: true },
  { id: 'demo-starting-06', type: 'auction-starting', lotId: 'lote-06', lotOrder: 6, createdAt: new Date(Date.now() - 7 * 60 * 60_000).toISOString(), read: true },
]

function notify(eventName = CHANGE_EVENT) {
  window.dispatchEvent(new CustomEvent(eventName))
}

export function getDemoNotifications(): DemoNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed as DemoNotification[]
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotifications))
  } catch {
    // Si el almacenamiento local no está disponible, se conserva el demo en memoria.
  }
  return initialNotifications
}

function saveNotifications(notifications: DemoNotification[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)) } catch { /* demo sin persistencia */ }
  notify()
}

export function subscribeDemoNotifications(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function markDemoNotificationRead(id: string) {
  saveNotifications(getDemoNotifications().map((item) => item.id === id ? { ...item, read: true } : item))
}

export function markAllDemoNotificationsRead(lotIds?: string[]) {
  const allowed = lotIds ? new Set(lotIds) : null
  saveNotifications(getDemoNotifications().map((item) =>
    !allowed || allowed.has(item.lotId) ? { ...item, read: true } : item,
  ))
}

export function createDemoNotification(type: DemoNotificationType, lotId: string, lotOrder: number) {
  const notification: DemoNotification = {
    id: `demo-${type}-${Date.now()}`,
    type,
    lotId,
    lotOrder,
    createdAt: new Date().toISOString(),
    read: false,
  }
  const updated = [notification, ...getDemoNotifications()]
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { /* demo sin persistencia */ }
  notify()
  window.dispatchEvent(new CustomEvent(CREATED_EVENT, { detail: notification }))
  return notification
}

export function subscribeToCreatedDemoNotifications(listener: (notification: DemoNotification) => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = (event: Event) => listener((event as CustomEvent<DemoNotification>).detail)
  window.addEventListener(CREATED_EVENT, handler)
  return () => window.removeEventListener(CREATED_EVENT, handler)
}

export function demoNotificationText(notification: DemoNotification) {
  const lot = `Lote ${String(notification.lotOrder).padStart(2, '0')}`
  switch (notification.type) {
    case 'outbid': return `Te superaron en el ${lot}`
    case 'closing': return `El ${lot} cierra en 1 minuto`
    case 'won': return `Ganaste el ${lot}`
    case 'sold': return `${lot} vendido`
    case 'auction-starting': return `La subasta está por iniciar · ${lot}`
  }
}

export function relativeNotificationTime(isoDate: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60_000))
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.floor(hours / 24)} día${hours >= 48 ? 's' : ''}`
}

export function unreadNotificationBadge(count: number) {
  return count > 9 ? '9+' : count > 0 ? String(count) : undefined
}
