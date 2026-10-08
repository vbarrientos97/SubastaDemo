'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { BrandMark } from '@/components/layout/brand-mark'
import { isNavItemActive, mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function DesktopSidebar() {
  const pathname = usePathname()
  const { favoriteLotIds, user } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (collapsed) return

    function handleOutsideClick(event: PointerEvent) {
      if (!sidebarRef.current?.contains(event.target as Node)) setCollapsed(true)
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [collapsed])

  const items = mainNav.filter((item) => {
    if (item.href === '/notificaciones') return false
    if (item.auth && !user) return false
    if (item.buyer && user?.role !== 'buyer') return false
    return true
  })

  return (
    <aside
      ref={sidebarRef}
      aria-label="Navegación principal"
      className={cn(
        'fixed inset-y-0 left-0 z-[60] hidden flex-col overflow-hidden rounded-r-3xl border border-border bg-background/95 shadow-2xl shadow-black/25 backdrop-blur-xl transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[4.5rem]' : 'w-60',
      )}
    >
      <div className={cn('flex shrink-0', collapsed ? 'flex-col items-center gap-2 px-2 py-3' : 'h-[4.5rem] items-center justify-between px-4')}>
        {collapsed ? (
          <>
            <Link href="/" aria-label="Subasta Ganadera" title="Subasta Ganadera">
              <BrandMark className="h-9 w-9 rounded-lg" />
            </Link>
            <button type="button" onClick={() => setCollapsed(false)} aria-label="Expandir menú" title="Expandir menú" className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <Link href="/" aria-label="Inicio" className="flex min-w-0 items-center gap-3">
              <BrandMark className="h-10 w-10" />
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-bold text-foreground">Subasta Ganadera</span>
                <span className="block truncate text-xs text-muted-foreground">En vivo</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Contraer menú"
              title="Contraer menú"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <nav className="flex flex-col gap-1 overflow-y-auto p-2" aria-label="Secciones">
        {items.map((item) => {
          const active = isNavItemActive(pathname, item.href)
          const Icon = item.icon
          const badge = item.href === '/favoritos' ? favoriteLotIds.length || undefined : item.badge
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'relative flex min-h-11 items-center rounded-xl text-sm font-semibold transition-colors',
                collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <span className="relative shrink-0">
                <Icon className="h-5 w-5" />
                {badge ? <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{badge}</span> : null}
                {item.dot ? <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" /> : null}
              </span>
              {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
