'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { auctionStatusColor, auctionStatusLabel } from '@/lib/domain/auction'
import { BrandMark } from '@/components/layout/brand-mark'
import { adminNav, auctionWorkspaceNav, isNavItemActive, type NavItem } from '@/lib/navigation'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function AdminSidebar({ showMobileMenu = false }: { showMobileMenu?: boolean }) {
  const pathname = usePathname()
  const { state } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    if (collapsed && !mobileOpen) return

    function handleOutsideClick(event: PointerEvent) {
      if (sidebarRef.current?.contains(event.target as Node)) return
      if (window.innerWidth < 1024) {
        setMobileOpen(false)
        return
      }
      if (!collapsed) setCollapsed(true)
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [collapsed, mobileOpen])

  const match = pathname.match(/^\/admin\/subastas\/([^/]+)/)
  const auctionId = match?.[1]
  const auction = state?.auctions.find((item) => item.id === auctionId)
  const workspaceItems = auctionId ? auctionWorkspaceNav(auctionId) : []
  const mobileMenuVisible = Boolean(auctionId) || showMobileMenu

  return (
    <aside ref={sidebarRef} className={cn(
      panel,
      'relative z-40 shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-[60] lg:flex lg:flex-col lg:overflow-hidden lg:rounded-r-3xl lg:shadow-2xl lg:shadow-black/25 lg:backdrop-blur-xl lg:transition-[width] lg:duration-200',
      !mobileMenuVisible && 'hidden lg:flex',
      collapsed ? 'lg:w-[4.5rem]' : 'lg:w-60',
    )}>
      {mobileMenuVisible ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>{auctionId ? 'Subasta actual' : 'Administración'}</span>
              {auction ? <span className={auctionStatusColor(auction.status)}>· {auctionStatusLabel(auction.status)}</span> : null}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{auction?.title || 'Gestión de subastas'}</p>
          </div>
          <button
            type="button"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      ) : null}

      {mobileOpen ? (
        <div id="admin-mobile-navigation" className="absolute inset-x-0 top-full z-[65] mt-2 max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-2xl lg:hidden">
          <nav aria-label="Navegación de administración" className="flex flex-col gap-1">
            {adminNav.map((item) => (
              <MobileSidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} onNavigate={() => setMobileOpen(false)} />
            ))}
          </nav>
          {workspaceItems.length > 0 ? (
            <nav aria-label="Secciones de la subasta" className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
                {workspaceItems.map((item) => (
                  <MobileSidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} onNavigate={() => setMobileOpen(false)} />
                ))}
            </nav>
          ) : null}
        </div>
      ) : null}

      <div className="hidden min-h-0 flex-1 flex-col lg:flex">
      <div className={cn('flex shrink-0 py-3', collapsed ? 'flex-col items-center gap-2 px-2' : 'items-center justify-between px-4')}>
        {collapsed ? (
          <>
            <div className="lg:hidden">
              <Link href="/admin" aria-label="Administración" className="flex items-center gap-3">
                <BrandMark />
                <span>
                  <span className="block font-display text-base font-bold text-foreground">Administración</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Subastas ganaderas</span>
                </span>
              </Link>
            </div>
            <Link href="/admin" aria-label="Administración" title="Administración" className="hidden lg:block">
              <BrandMark className="h-9 w-9 rounded-lg" />
            </Link>
            <button type="button" onClick={() => setCollapsed(false)} aria-label="Expandir menú" title="Expandir menú" className="hidden h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground lg:inline-flex">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <Link href="/admin" aria-label="Administración" className="flex min-w-0 items-center gap-3">
              <BrandMark />
              <span className="min-w-0">
                <span className="block truncate font-display text-base font-bold text-foreground">Administración</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">Subastas ganaderas</span>
              </span>
            </Link>
            <button type="button" onClick={() => setCollapsed(true)} aria-label="Contraer menú" title="Contraer menú" className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground lg:inline-flex">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <nav aria-label="Navegación de administración" className={cn('flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto', collapsed && 'lg:items-center')}>
        {adminNav.map((item) => (
          <SidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} collapsed={collapsed} />
        ))}
      </nav>
      {workspaceItems.length > 0 ? (
        <>
          <div className={cn('border-y border-border py-3', collapsed ? 'px-2 text-center' : 'px-4')}>
            <p className={cn('text-[11px] font-bold uppercase tracking-wider text-muted-foreground', collapsed && 'lg:sr-only')}>Subasta actual</p>
            <p className={cn('mt-1 truncate text-sm font-semibold text-foreground', collapsed && 'lg:sr-only')}>{auction?.title || 'Sin título'}</p>
            {auction ? <p className={cn('mt-0.5 text-xs', auctionStatusColor(auction.status), collapsed && 'lg:sr-only')}>{auctionStatusLabel(auction.status)}</p> : null}
            {collapsed ? <span aria-hidden="true" className="hidden text-xs font-bold text-primary lg:inline">{auction?.title?.slice(0, 1) || 'S'}</span> : null}
          </div>
          <nav aria-label="Secciones de la subasta" className={cn('flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto', collapsed && 'lg:items-center')}>
            {workspaceItems.map((item) => (
              <SidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} collapsed={collapsed} />
            ))}
          </nav>
        </>
      ) : null}
      </div>
    </aside>
  )
}

function MobileSidebarLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function SidebarLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        'inline-flex min-h-10 shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors lg:w-full',
        collapsed && 'lg:w-10 lg:justify-center lg:px-0',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      <span className={cn('truncate', collapsed && 'lg:sr-only')}>{item.label}</span>
    </Link>
  )
}
