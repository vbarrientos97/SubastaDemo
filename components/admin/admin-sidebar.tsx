'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { adminNav, auctionWorkspaceNav, isNavItemActive, type NavItem } from '@/lib/navigation'
import { mobileMenuTrigger, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { AccountDrawerSection } from '@/components/account/profile-menu'
import { AdminMobileMenu } from '@/components/admin/admin-mobile-menu'

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (collapsed && !mobileOpen) return

    function handleOutsideClick(event: PointerEvent) {
      if (sidebarRef.current?.contains(event.target as Node) || triggerRef.current?.contains(event.target as Node)) return
      if (window.innerWidth < 1024) return
      if (!collapsed) setCollapsed(true)
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [collapsed, mobileOpen])

  const match = pathname.match(/^\/admin\/subastas\/([^/]+)/)
  const auctionId = match?.[1]
  const workspaceItems = auctionId ? auctionWorkspaceNav(auctionId) : []
  const administrationItems = adminNav
  const triggerRef = useRef<HTMLButtonElement>(null)

  const closeMobileMenu = useCallback(() => setMobileOpen(false), [])

  const [previousPath, setPreviousPath] = useState(pathname)
  if (previousPath !== pathname) { setPreviousPath(pathname); setMobileOpen(false) }


  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Abrir menú de administración"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className={cn(mobileMenuTrigger, 'fixed right-4 top-3 z-50 lg:hidden')}
      >
        <Menu className="h-6 w-6" />
      </button>
      <AdminMobileMenu open={mobileOpen} onClose={closeMobileMenu} triggerRef={triggerRef} pathname={pathname} administrationItems={administrationItems} workspaceItems={workspaceItems} />
      <aside ref={sidebarRef} className={cn(
        panel,
        'bg-drawer dark:bg-surface relative z-40 shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-[60] lg:flex lg:flex-col lg:overflow-hidden lg:rounded-r-3xl lg:shadow-2xl lg:shadow-black/25 lg:backdrop-blur-xl lg:transition-[width] lg:duration-200',
        'hidden lg:flex',
        collapsed ? 'lg:w-[4.5rem]' : 'lg:w-60',
      )}>
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
            {administrationItems.map((item) => (
              <SidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} collapsed={collapsed} />
            ))}
          </nav>
          {workspaceItems.length > 0 ? (
            <>
              <nav aria-label="Secciones de la subasta" className={cn('flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto', collapsed && 'lg:items-center')}>
                {workspaceItems.map((item) => (
                  <SidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} collapsed={collapsed} />
                ))}
              </nav>
            </>
          ) : null}
          <AccountDrawerSection collapsed={collapsed} onNavigate={() => { }} />
        </div>
      </aside>
    </>
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
