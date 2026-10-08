'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { isNavItemActive, mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { NotificationsMenu } from '@/components/layout/notifications-menu'

export function MainNav({ variant }: { variant: 'bar' | 'dock' }) {
  const pathname = usePathname()
  const { favoriteLotIds, user } = useSession()
  const favCount = user ? favoriteLotIds.length : 0
  const items = mainNav.filter((item) => {
    if (item.auth && !user) return false
    if (item.buyer && user?.role !== 'buyer') return false
    return true
  })

  if (variant === 'dock') {
    return (
      <ul className="flex items-center justify-around">
        {items.map((item) => {
          const active = isNavItemActive(pathname, item.href)
          const Icon = item.icon
          const badge = item.href === '/favoritos' ? favCount || undefined : item.badge
          return (
            <li key={item.href} className="flex-1">
              {item.href === '/notificaciones' ? <NotificationsMenu variant="dock" /> : (
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="relative">
                  <Icon className={cn('h-[22px] w-[22px]', active && 'fill-primary/15')} />
                  {badge ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {badge}
                    </span>
                  ) : null}
                  {item.dot ? (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                  ) : null}
                </span>
                {item.label}
              </Link>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <nav className="flex min-w-0 flex-1 items-center gap-1">
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href)
        const Icon = item.icon
        const badge = item.href === '/favoritos' ? favCount || undefined : item.badge
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-surface hover:text-foreground',
            )}
          >
            <span className="relative">
              <Icon className="h-4 w-4" />
              {badge ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {badge}
                </span>
              ) : null}
              {item.dot ? (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              ) : null}
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
