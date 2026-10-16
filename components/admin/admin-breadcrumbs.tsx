'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { BackLink } from '@/components/layout/back-link'

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const { state } = useSession()
  const match = pathname.match(/^\/admin\/subastas\/([^/]+)(?:\/(.*))?$/)
  if (!match) return null

  const [, auctionId, rest = ''] = match
  const auction = state?.auctions.find((item) => item.id === auctionId)
  const base = `/admin/subastas/${auctionId}`
  const section = rest.split('/')[0]
  const sectionLabels: Record<string, string> = {
    lotes: 'Lotes', clientes: 'Clientes', reportes: 'Reportes', editar: 'Editar subasta',
  }
  const currentLabel = sectionLabels[section] ?? auction?.title ?? 'Subasta'
  const parentHref = section === 'editar' || !section ? '/admin' : base

  return (
    <>
      <div className="mb-4 lg:hidden">
        <BackLink href={parentHref}>
          {section === 'editar' ? 'Volver a subastas' : !section ? 'Volver a subastas' : `Volver a ${auction?.title ?? 'subasta'}`}
        </BackLink>
      </div>
      <nav aria-label="Ruta de navegación" className="mb-5 hidden items-center gap-2 text-sm lg:flex">
        <Link href="/admin" className="min-h-11 content-center rounded-lg px-2 font-semibold text-primary hover:bg-accent">Subastas</Link>
        <span aria-hidden="true" className="text-muted-foreground">›</span>
        {!section ? (
          <span aria-current="page" className="truncate px-2 font-semibold text-foreground">{currentLabel}</span>
        ) : (
          <>
            <Link href={base} className="min-h-11 content-center rounded-lg px-2 font-semibold text-primary hover:bg-accent">{auction?.title ?? 'Subasta'}</Link>
            <span aria-hidden="true" className="text-muted-foreground">›</span>
            <span aria-current="page" className="truncate px-2 font-semibold text-foreground">{currentLabel}</span>
          </>
        )}
      </nav>
    </>
  )
}
