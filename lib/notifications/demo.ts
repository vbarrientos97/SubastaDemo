import { createNotificationStore, isDemoNotification, NOTIFICATIONS_PREFIX, type DemoNotification, type DemoNotificationType } from '@/lib/notifications/store'
export type { DemoNotification, DemoNotificationType } from '@/lib/notifications/store'

const CHANGE_EVENT = 'subasta:notifications-changed'
const CREATED_EVENT = 'subasta:notification-created'
const store = createNotificationStore(() => window.localStorage)

export function getDemoNotifications(accountId: string | null): DemoNotification[] {
  return typeof window === 'undefined' || !accountId ? [] : store.load(accountId)
}

function saveNotifications(accountId: string, notifications: DemoNotification[]) {
  store.save(accountId, notifications)
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: accountId }))
}

export function subscribeDemoNotifications(accountId: string | null, listener: () => void) {
  const onChange = (event: Event) => { if ((event as CustomEvent<string>).detail === accountId) listener() }
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || (accountId && event.key === NOTIFICATIONS_PREFIX + encodeURIComponent(accountId))) listener()
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function markDemoNotificationRead(accountId: string, id: string) {
  saveNotifications(accountId, getDemoNotifications(accountId).map((item) => item.id === id ? { ...item, read: true } : item))
}

export function markAllDemoNotificationsRead(accountId: string, lotIds?: string[]) {
  const allowed = lotIds ? new Set(lotIds) : null
  saveNotifications(accountId, getDemoNotifications(accountId).map((item) =>
    !allowed || allowed.has(item.lotId) ? { ...item, read: true } : item))
}

export function createDemoNotification(accountId: string, type: DemoNotificationType, lotId: string, lotOrder: number) {
  const notification: DemoNotification = {
    id: crypto.randomUUID(), type, lotId, lotOrder, createdAt: new Date().toISOString(), read: false,
  }
  saveNotifications(accountId, [notification, ...getDemoNotifications(accountId)])
  window.dispatchEvent(new CustomEvent(CREATED_EVENT, { detail: { accountId, notification } }))
  return notification
}

export function subscribeToCreatedDemoNotifications(accountId: string, listener: (notification: DemoNotification) => void) {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ accountId?: string; notification?: unknown }>).detail
    if (detail?.accountId === accountId && isDemoNotification(detail.notification)) listener(detail.notification)
  }
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
