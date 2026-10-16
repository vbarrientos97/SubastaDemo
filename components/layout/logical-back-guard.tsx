'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { buyerHomeAuctionId } from '@/lib/domain/auction'

function safePath(path: string | null, fallback: string) {
  return path?.startsWith('/') && !path.startsWith('//') ? path : fallback
}

export function LogicalBackGuard() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, user, client } = useSession()

  useEffect(() => {
    function parentPath(): string | null {
      if (pathname === '/') return null
      if (pathname === '/admin') return null
      if (pathname === '/entrar') {
        const next = new URLSearchParams(window.location.search).get('next')
        const lotMatch = next?.match(/^\/lote\/([^/?]+)/)
        const lot = lotMatch ? state?.lots.find((item) => item.id === lotMatch[1]) : null
        const auctionMatch = next?.match(/^\/subasta\/([^/?]+)/)
        return lot ? `/subasta/${lot.auctionId}` : auctionMatch ? `/subasta/${auctionMatch[1]}` : '/'
      }
      if (pathname === '/registro') {
        const next = new URLSearchParams(window.location.search).get('next')
        return `/entrar${next ? `?next=${encodeURIComponent(safePath(next, '/'))}` : ''}`
      }
      if (/^\/subasta\/[^/]+$/.test(pathname)) {
        return user?.role === 'buyer' ? pathname : '/'
      }
      if (/^\/lote\/[^/]+$/.test(pathname)) {
        const requested = new URLSearchParams(window.location.search).get('returnTo')
        if (user?.role === 'admin') {
          const lotId = pathname.split('/')[2]
          const lot = state?.lots.find((item) => item.id === lotId)
          return lot ? `/admin/subastas/${lot.auctionId}/lotes` : '/admin'
        }
        const lotId = pathname.split('/')[2]
        const lot = state?.lots.find((item) => item.id === lotId)
        return safePath(requested, lot ? `/subasta/${lot.auctionId}` : '/')
      }
      if (pathname === '/admin/subastas' || /^\/admin\/subastas\/[^/]+\/editar$/.test(pathname)) return '/admin'
      const adminWorkspace = pathname.match(/^\/admin\/subastas\/([^/]+)\/(lotes|clientes|reportes)(?:\/.*)?$/)
      if (adminWorkspace) return `/admin/subastas/${adminWorkspace[1]}`
      if (/^\/admin\/subastas\/[^/]+$/.test(pathname)) return '/admin'
      if (['/favoritos', '/pujas', '/ajustes'].includes(pathname)) {
        if (user?.role === 'admin') return '/admin'
        const homeAuction = state?.currentAuctionId ?? (state && client ? buyerHomeAuctionId(state.auctions, client.id) : null)
        return homeAuction ? `/subasta/${homeAuction}` : '/'
      }
      if (pathname === '/notificaciones' || pathname === '/customer') return '/'
      return '/'
    }

    function beforeNavigate(href: string) {
      const event = new CustomEvent('app:before-navigation', { cancelable: true, detail: { href } })
      window.dispatchEvent(event)
      return event.defaultPrevented
    }

    function onPopState() {
      const parent = parentPath()
      if (parent === null) {
        // Inicio de un flujo: don't let browser history reopen login or an unrelated screen.
        if (user?.role === 'buyer' && /^\/subasta\/[^/]+$/.test(pathname)) router.replace(pathname)
        return
      }
      if (beforeNavigate(parent)) {
        router.replace(pathname + window.location.search)
        return
      }
      router.replace(parent)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [pathname, router, state, user, client])

  return null
}
