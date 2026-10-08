'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useSession } from '@/components/auth/session-provider'
import type { Auction } from '@/lib/domain/auction'

export function AuctionScope({
  id,
  children,
}: {
  id: string
  children: (auction: Auction) => ReactNode
}) {
  const { state } = useSession()
  if (!state) return <p className="text-sm text-muted-foreground">Cargando…</p>
  const auction = state.auctions.find((item) => item.id === id) ?? null
  if (!auction) {
    return (
      <p className="text-sm text-muted-foreground">
        Esa subasta ya no está.{' '}
        <Link href="/admin" className="font-semibold text-primary">
          Volver al listado
        </Link>
      </p>
    )
  }
  return children(auction)
}
