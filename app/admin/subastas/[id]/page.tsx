'use client'

import { use } from 'react'
import { Board } from '@/components/admin/board'
import { AuctionScope } from '@/components/admin/auction-scope'

export default function AdminAuctionDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <AuctionScope id={id}>{(auction) => <Board auctionId={auction.id} />}</AuctionScope>
}
