'use client'

import { use } from 'react'
import { AuctionScope } from '@/components/admin/auction-scope'
import { LotManager } from '@/components/admin/lot-manager'

export default function AdminAuctionLotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <AuctionScope id={id}>
      {(auction) => <LotManager key={auction.id} auctionId={auction.id} />}
    </AuctionScope>
  )
}
