'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { adminNav, auctionWorkspaceNav, isNavItemActive, type NavItem } from '@/lib/navigation'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { AccountDrawerSection } from '@/components/account/profile-menu'

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
  const administrationItems = auctionId ? [] : adminNav
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [mobileOpen])

  return (
    <>
    <button
      ref={triggerRef}
      type="button"
      aria-label="Abrir menú de administración"
      aria-expanded={mobileOpen}
      onClick={() => setMobileOpen(true)}
      className="fixed left-4 top-3 z-50 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
    >
      <Menu className="h-6 w-6" />
    </button>
    {mobileOpen && typeof document !== 'undefined' ? createPortal(
      <div className="fixed inset-0 z-[100] bg-overlay backdrop-blur-[2px] dark:bg-black/75 lg:hidden">
        <button type="button" aria-label="Cerrar menú" className="absolute inset-0" onClick={() => setMobileOpen(false)} />
        <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menú de administración" className="absolute inset-y-0 left-0 z-10 flex w-[min(20rem,88vw)] flex-col border-r border-border bg-drawer shadow-[var(--shadow-card)] dark:bg-surface">
          <header className="flex min-h-16 items-center gap-3 border-b border-border px-4">
            <BrandMark className="h-10 w-10 shrink-0 rounded-lg" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-foreground">Administración</span>
              <span className="block truncate text-xs text-muted-foreground">Subastas ganaderas</span>
            </span>
            <button ref={closeButtonRef} type="button" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <X className="h-5 w-5" />
            </button>
          </header>
          <nav aria-label="Navegación de administración" className="flex flex-col gap-1 overflow-y-auto p-3">
            {administrationItems.map((item) => <MobileSidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} onNavigate={() => setMobileOpen(false)} />)}
            {workspaceItems.length > 0 ? <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2" aria-label="Secciones de la subasta">
              {workspaceItems.map((item) => <MobileSidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} onNavigate={() => setMobileOpen(false)} />)}
            </div> : null}
          </nav>
          <AccountDrawerSection onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>, document.body,
    ) : null}
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
      <AccountDrawerSection collapsed={collapsed} onNavigate={() => {}} />
      </div>
    </aside>
    </>
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
