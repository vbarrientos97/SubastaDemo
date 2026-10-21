'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useSession } from '@/components/auth/session-provider'
import { getDemoNotifications, markAllDemoNotificationsRead, markDemoNotificationRead, subscribeDemoNotifications, type DemoNotification } from '@/lib/notifications/demo'

export function useDemoNotifications(allowedLotIds?: string[]) {
  const { user } = useSession()
  const accountId = user?.role === 'buyer' ? user.id : null
  const subscribe = useCallback((listener: () => void) => subscribeDemoNotifications(accountId, listener), [accountId])
  const getSnapshot = useCallback(() => JSON.stringify(getDemoNotifications(accountId)), [accountId])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => '[]')
  const notifications = useMemo(() => {
    const rows: DemoNotification[] = JSON.parse(snapshot)
    const allowed = allowedLotIds ? new Set(allowedLotIds) : null
    return allowed ? rows.filter((row) => allowed.has(row.lotId)) : rows
  }, [snapshot, allowedLotIds])
  return {
    notifications,
    unreadCount: notifications.filter((row) => !row.read).length,
    markRead: (id: string) => { if (accountId) markDemoNotificationRead(accountId, id) },
    markAllRead: () => { if (accountId) markAllDemoNotificationsRead(accountId, allowedLotIds) },
  }
}
