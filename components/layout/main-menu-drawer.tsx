'use client'

import Link from 'next/link'
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
import { useMainMenuDrawer } from '@/components/layout/use-main-menu-drawer'

export function MainMenuDrawer({ floating = false }: { floating?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, user, favoriteLotIds, buyerLots, signOut } = useSession()
  const { unreadCount } = useDemoNotifications(buyerLots.map((lot) => lot.id))
  const notificationBadge = user?.role === 'buyer' ? unreadNotificationBadge(unreadCount) : undefined
  const { open, triggerRef, closeRef, menuRef, closeMenu, openMenu, hideMenu, handleTouchStart, handleTouchEnd } = useMainMenuDrawer(pathname)

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
        onClick={openMenu}
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
            onTouchStart={handleTouchStart}
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
              {user ? <AccountDrawerSection onNavigate={hideMenu} /> : null}
            </footer>
          </aside>
        </div>, document.body,
      ) : null}
    </>
  )
}
