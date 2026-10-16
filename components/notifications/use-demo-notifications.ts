'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getDemoNotifications,
  markAllDemoNotificationsRead,
  markDemoNotificationRead,
  subscribeDemoNotifications,
  type DemoNotification,
} from '@/lib/application/notifications'

export function useDemoNotifications(allowedLotIds?: string[]) {
  const [notifications, setNotifications] = useState<DemoNotification[]>([])
  const allowedKey = allowedLotIds === undefined ? null : allowedLotIds.join('\u0000')
  const refresh = useCallback(() => {
    const all = getDemoNotifications()
    if (allowedKey === null) setNotifications(all)
    else {
      const allowed = new Set(allowedKey ? allowedKey.split('\u0000') : [])
      setNotifications(all.filter((item) => allowed.has(item.lotId)))
    }
  }, [allowedKey])

  useEffect(() => {
    refresh()
    return subscribeDemoNotifications(refresh)
  }, [refresh])

  return {
    notifications,
    unreadCount: notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
    markRead: markDemoNotificationRead,
    markAllRead: () => markAllDemoNotificationsRead(allowedLotIds),
  }
}
