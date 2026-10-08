'use client'

import { use } from 'react'
import { AuctionScope } from '@/components/admin/auction-scope'
import { ClientManager } from '@/components/admin/client-manager'

export default function AdminAuctionClientsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <AuctionScope id={id}>
      {(auction) => <ClientManager key={auction.id} auctionId={auction.id} />}
    </AuctionScope>
  )
}
