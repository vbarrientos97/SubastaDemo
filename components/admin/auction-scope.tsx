'use client'

import type { ReactNode } from 'react'
import { useSession } from '@/components/auth/session-provider'
import type { Auction } from '@/lib/domain/auction'
import { BackLink } from '@/components/layout/back-link'
import { usePathname } from 'next/navigation'

export function AuctionScope({
  id,
  children,
}: {
  id: string
  children: (auction: Auction) => ReactNode
}) {
  const pathname = usePathname()
  const { state } = useSession()
  const parentHref = pathname.endsWith('/editar') || /^\/admin\/subastas\/[^/]+$/.test(pathname)
    ? '/admin'
    : `/admin/subastas/${id}`
  if (!state) return <div className="flex flex-col items-start gap-3"><p className="text-sm text-muted-foreground">Cargando…</p><BackLink href={parentHref} /></div>
  const auction = state.auctions.find((item) => item.id === id) ?? null
  if (!auction) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">Esa subasta ya no está.</p>
        <BackLink href="/admin">Volver al listado</BackLink>
      </div>
    )
  }
  return children(auction)
}
