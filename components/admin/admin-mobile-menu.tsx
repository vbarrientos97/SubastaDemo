'use client'

import Link from 'next/link'
import { useEffect, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { AccountDrawerSection } from '@/components/account/profile-menu'
import { isNavItemActive, type NavItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function AdminMobileMenu({ open, onClose, triggerRef, pathname, administrationItems, workspaceItems }: {
  open: boolean
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
  pathname: string
  administrationItems: NavItem[]
  workspaceItems: NavItem[]
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef.current
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
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
      trigger?.focus()
    }
  }, [open, onClose, triggerRef])

  return (
    <>
      {open && typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[100] bg-overlay backdrop-blur-[2px] dark:bg-black/75 lg:hidden">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0" onClick={() => onClose()} />
          <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menú de administración" className="absolute inset-y-0 right-0 z-10 flex w-[min(20rem,88vw)] flex-col border-l border-border bg-drawer shadow-[var(--shadow-card)] dark:bg-surface">
            <header className="flex min-h-16 items-center gap-3 border-b border-border px-4">
              <BrandMark className="h-10 w-10 shrink-0 rounded-lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-foreground">Administración</span>
                <span className="block truncate text-xs text-muted-foreground">Subastas ganaderas</span>
              </span>
              <button ref={closeButtonRef} type="button" aria-label="Cerrar menú" onClick={() => onClose()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <X className="h-5 w-5" />
              </button>
            </header>
            <nav aria-label="Navegación de administración" className="flex flex-col gap-1 overflow-y-auto p-3">
              {administrationItems.map((item) => <MobileSidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} onNavigate={() => onClose()} />)}
              {workspaceItems.length > 0 ? <div className="flex flex-col gap-1" aria-label="Secciones de la subasta">
                {workspaceItems.map((item) => <MobileSidebarLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} onNavigate={() => onClose()} />)}
              </div> : null}
            </nav>
            <AccountDrawerSection onNavigate={() => onClose()} />
          </aside>
        </div>, document.body,
      ) : null}
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

