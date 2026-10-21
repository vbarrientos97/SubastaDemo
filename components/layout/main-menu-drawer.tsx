'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Gavel, Heart, Home, LogIn, Menu, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { AccountDrawerSection } from '@/components/account/profile-menu'
import { useDemoNotifications } from '@/components/notifications/use-demo-notifications'
import { unreadNotificationBadge } from '@/lib/notifications/demo'
import { BrandMark } from '@/components/layout/brand-mark'
import { requestNavigation } from '@/lib/before-navigation'
import { cn } from '@/lib/utils'
import { mobileMenuTrigger } from '@/lib/styles'

export function MainMenuDrawer({ floating = false }: { floating?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, user, favoriteLotIds, buyerLots, signOut } = useSession()
  const { unreadCount } = useDemoNotifications(buyerLots.map((lot) => lot.id))
  const notificationBadge = user?.role === 'buyer' ? unreadNotificationBadge(unreadCount) : undefined
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const [previousPath, setPreviousPath] = useState(pathname)
  if (previousPath !== pathname) { setPreviousPath(pathname); setOpen(false) }

  const closeMenu = useCallback((afterClose?: () => void) => {
    if (window.history.state?.mainMenuDrawer) {
      if (afterClose) window.addEventListener('popstate', () => afterClose(), { once: true })
      window.history.back()
    } else {
      afterClose?.()
    }
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef.current
    document.body.style.overflow = 'hidden'
    window.history.pushState({ ...window.history.state, mainMenuDrawer: true }, '', window.location.href)
    closeRef.current?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!menuRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    function onPopState() { setOpen(false) }
    document.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPopState)
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [closeMenu, open])

  function handleMenuClick(event: React.MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement
    if (target.closest('[data-menu-sign-out]')) {
      event.preventDefault()
      event.stopPropagation()
      requestNavigation('/entrar', () => closeMenu(() => {
        signOut()
        router.push('/entrar')
      }))
      return
    }
    const anchor = target.closest<HTMLAnchorElement>('a[href^="/"]')
    if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === '_blank') return
    event.preventDefault()
    event.stopPropagation()
    closeMenu(() => router.push(anchor.href.replace(window.location.origin, '')))
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const start = touchStartRef.current
    const end = event.changedTouches[0]
    touchStartRef.current = null
    if (start && end.clientX - start.x > 60 && Math.abs(start.y - end.clientY) < 80) closeMenu()
  }

  const items = [
    { href: '/', label: 'Inicio', icon: Home },
    ...(user?.role === 'buyer' ? [{ href: '/pujas', label: 'Pujas', icon: Gavel }] : []),
    ...(user ? [{ href: '/favoritos', label: 'Favoritos', icon: Heart }] : []),
    ...(user?.role === 'buyer' ? [{ href: '/notificaciones', label: 'Notificaciones', icon: Bell }] : []),
  ]

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="main-mobile-menu"
        onClick={() => setOpen(true)}
        className={cn(mobileMenuTrigger, floating && 'fixed right-4 top-3 z-50 lg:hidden')}
      >
        <span className="relative"><Menu className="h-6 w-6" />{notificationBadge ? <span aria-label={`${unreadCount} notificaciones sin leer`} className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{notificationBadge}</span> : null}</span>
      </button>

      {open && typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[100] bg-overlay backdrop-blur-[2px] dark:bg-black/75 lg:hidden">
          <button type="button" aria-label="Cerrar menú" tabIndex={-1} className="absolute inset-0 bg-transparent" onClick={() => closeMenu()} />
          <aside
            ref={menuRef}
            id="main-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="main-mobile-menu-title"
            onClickCapture={handleMenuClick}
            onTouchStart={(event) => { touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY } }}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-y-0 right-0 z-10 flex w-[min(20rem,88vw)] flex-col border-l border-border bg-drawer shadow-[var(--shadow-card)] dark:bg-background dark:shadow-2xl"
          >
            <header className="flex min-h-16 items-center gap-3 border-b border-border px-4">
              <BrandMark className="h-9 w-9 rounded-lg" />
              <span id="main-mobile-menu-title" className="flex-1 font-display text-base font-bold text-foreground">Subasta Ganadera</span>
              <button ref={closeRef} type="button" aria-label="Cerrar menú" onClick={() => closeMenu()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <X className="h-5 w-5" />
              </button>
            </header>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Secciones">
              {items.map(({ href, label, icon: Icon }) => {
                const active = href === '/' ? pathname === '/' || pathname.startsWith('/subasta/') : pathname.startsWith(href)
                const badge = href === '/favoritos' ? (favoriteLotIds.length ? String(favoriteLotIds.length) : undefined) : href === '/notificaciones' ? unreadNotificationBadge(unreadCount) : undefined
                return (
                  <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold', active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent')}>
                    <span className="relative"><Icon className="h-5 w-5" />{badge ? <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{badge}</span> : null}</span>
                    <span className="flex-1">{label}</span>
                  </Link>
                )
              })}
              {!user && ready ? (
                <Link href={`/entrar?next=${encodeURIComponent(pathname)}`} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold text-foreground hover:bg-accent">
                  <LogIn className="h-5 w-5" />
                  Ingresar
                </Link>
              ) : null}
            </nav>

            <footer className="border-t border-border p-3">
              {user ? <AccountDrawerSection onNavigate={() => setOpen(false)} /> : null}
            </footer>
          </aside>
        </div>, document.body,
      ) : null}
    </>
  )
}
