import type { LucideIcon } from 'lucide-react'
import { BarChart3, Bell, Gavel, Heart, Home, LayoutGrid, List, Users } from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
  /** If true, only shown when the user is signed in. */
  auth?: boolean
  /** If true, only shown to buyers. */
  buyer?: boolean
}

export const mainNav: NavItem[] = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/pujas', label: 'Pujas', icon: Gavel, auth: true, buyer: true },
  { href: '/favoritos', label: 'Favoritos', icon: Heart, auth: true },
  { href: '/notificaciones', label: 'Notificaciones', icon: Bell, auth: true, buyer: true },
]

export function isNavItemActive(pathname: string, href: string) {
  if (href === '/' || href === '/admin') return pathname === href
  if (/^\/admin\/subastas\/[^/]+$/.test(href)) return pathname === href
  return pathname.startsWith(href)
}

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Subastas', icon: Gavel },
]

/** Menú interno de una subasta. Configuración se abre desde Editar en el listado. */
export function auctionWorkspaceNav(auctionId: string): NavItem[] {
  const base = `/admin/subastas/${auctionId}`
  return [
    { href: base, label: 'Dashboard', icon: LayoutGrid },
    { href: `${base}/lotes`, label: 'Lotes', icon: List },
    { href: `${base}/clientes`, label: 'Clientes', icon: Users },
    { href: `${base}/reportes`, label: 'Reportes', icon: BarChart3 },
  ]
}
