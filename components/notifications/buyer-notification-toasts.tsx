'use client'

import { readPreference, writePreference } from '@/lib/browser-preferences'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BellRing, Check, Clock3, Gavel, X } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import {
  createDemoNotification,
  demoNotificationText,
  subscribeToCreatedDemoNotifications,
  type DemoNotification,
} from '@/lib/notifications/demo'
import { cn } from '@/lib/utils'
import { isActiveLot } from '@/lib/domain/lot'

const iconByType = { outbid: Gavel, closing: Clock3, won: Check, sold: BellRing, 'auction-starting': BellRing }

export function BuyerNotificationToasts() {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, user, buyerLots } = useSession()
  const lotIdsKey = buyerLots.map((lot) => lot.id).join('|')
  const [visible, setVisible] = useState<DemoNotification[]>([])
  const timers = useRef(new Set<number>())

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  useEffect(() => {
    if (!user) return
    const allowedLots = new Set(lotIdsKey ? lotIdsKey.split('|') : [])
    return subscribeToCreatedDemoNotifications(user.id, (notification) => {
      if (!allowedLots.has(notification.lotId) || readPreference('subasta.aviso-puja') === 'false') return
      setVisible((current) => [notification, ...current].slice(0, 2))
      const timer = window.setTimeout(() => {
        timers.current.delete(timer)
        setVisible((current) => current.filter((item) => item.id !== notification.id))
      }, 7000)
      timers.current.add(timer)
    })
  }, [lotIdsKey, user])

  useEffect(() => {
    function onSettingChange(event: Event) {
      if (!(event as CustomEvent<boolean>).detail) setVisible([])
    }
    window.addEventListener('subasta:bid-notice-setting-changed', onSettingChange)
    return () => window.removeEventListener('subasta:bid-notice-setting-changed', onSettingChange)
  }, [])

  useEffect(() => {
    if (!ready || user?.role !== 'buyer' || !(pathname === '/' || pathname.startsWith('/subasta/'))) return
    const demoKey = `subasta.demo-alerta-inicial.${user.id}`
    if (readPreference(demoKey, true)) return
    const demoLot = buyerLots.find(isActiveLot) ?? buyerLots[0]
    if (!demoLot) return
    const timer = window.setTimeout(() => {
      writePreference(demoKey, 'true', true)
      createDemoNotification(user.id, 'outbid', demoLot.id, demoLot.order)
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [pathname, ready, user, buyerLots])

  if (!ready || user?.role !== 'buyer' || visible.length === 0) return null

  return (
    <div aria-live="polite" aria-label="Avisos urgentes" className="pointer-events-none fixed inset-x-0 top-3 z-[120] mx-auto flex w-full max-w-md flex-col gap-2 px-3 lg:left-1/2 lg:right-auto lg:top-5 lg:w-[min(28rem,calc(100vw-2rem))] lg:-translate-x-1/2">
      {visible.map((notification) => {
        const Icon = iconByType[notification.type]
        const action = notification.type === 'won' || notification.type === 'sold' || notification.type === 'auction-starting' ? 'Ver lote' : 'Pujar'
        return (
          <section key={notification.id} role="status" className="pointer-events-auto rounded-2xl border border-border bg-background p-4 text-foreground shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive-soft text-destructive dark:bg-primary/10 dark:text-primary"><Icon className="h-5 w-5" /></span>
              <p className="min-w-0 flex-1 pt-1 font-display text-lg font-bold leading-snug">{demoNotificationText(notification)}</p>
              <button type="button" aria-label="Cerrar aviso" onClick={() => setVisible((items) => items.filter((item) => item.id !== notification.id))} className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <button type="button" onClick={() => { setVisible((items) => items.filter((item) => item.id !== notification.id)); router.push(`/lote/${notification.lotId}?returnTo=${encodeURIComponent(pathname)}`) }} className={cn('mt-3 min-h-11 w-full rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground hover:bg-primary-hover dark:hover:bg-primary/90')}>
              {action} · Lote {String(notification.lotOrder).padStart(2, '0')}
            </button>
          </section>
        )
      })}
    </div>
  )
}
