'use client'

import Link from 'next/link'
import { BellRing, Check, Clock3, Gavel, Trophy } from 'lucide-react'
import { BuyerGuard } from '@/components/auth/buyer-guard'
import { useDemoNotifications } from '@/components/notifications/use-demo-notifications'
import { TopBar } from '@/components/layout/top-bar'
import { BackLink } from '@/components/layout/back-link'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { demoNotificationText, relativeNotificationTime } from '@/lib/application/notifications'
import { useSession } from '@/components/auth/session-provider'

const iconByType = { outbid: Gavel, closing: Clock3, won: Trophy, sold: BellRing, 'auction-starting': BellRing }

function NotificationsContent() {
  const { buyerLots } = useSession()
  const { notifications, markRead, markAllRead } = useDemoNotifications(buyerLots.map((lot) => lot.id))
  const sorted = [...notifications].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <>
      <TopBar title="Notificaciones" backHref="/" />
      <main className="flex flex-col gap-4 px-4 py-4 lg:mx-auto lg:max-w-3xl lg:px-6 lg:py-8">
        <div className="hidden lg:block"><BackLink href="/" /></div>
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Notificaciones</h1>
            <p className="mt-1 text-sm text-muted-foreground">Avisos de tus lotes y de la subasta.</p>
          </div>
          {unreadCount > 0 ? <button type="button" onClick={markAllRead} className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-primary hover:bg-destructive-soft dark:hover:bg-primary/10">Marcar todas como leídas</button> : null}
        </header>

        {sorted.length === 0 ? (
          <section className={cn(panel, 'flex min-h-40 items-center justify-center p-6 text-center')}><p className="text-base font-semibold text-muted-foreground">No tienes notificaciones</p></section>
        ) : (
          <ul className={cn(panel, 'overflow-hidden divide-y divide-border')}>
            {sorted.map((notification) => {
              const Icon = iconByType[notification.type]
              return (
                <li key={notification.id}>
                  <Link href={`/lote/${notification.lotId}?returnTo=%2Fnotificaciones`} onClick={() => markRead(notification.id)} className={cn('flex min-h-[5.25rem] items-start gap-3 px-4 py-4 transition hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', !notification.read && 'bg-primary/[0.06]')}>
                    <span className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', notification.read ? 'bg-surface-2 text-muted-foreground' : 'bg-destructive-soft text-destructive dark:bg-primary/10 dark:text-primary')}><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span className={cn('flex-1 text-base leading-snug text-foreground', notification.read ? 'font-medium' : 'font-bold')}>{demoNotificationText(notification)}</span>
                        {!notification.read ? <span aria-label="No leída" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" /> : null}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{relativeNotificationTime(notification.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </>
  )
}

export default function NotificationsPage() {
  return <BuyerGuard><NotificationsContent /></BuyerGuard>
}
