'use client'

import { use } from 'react'
import { AuctionScope } from '@/components/admin/auction-scope'
import { AuctionReports } from '@/components/admin/auction-reports'

export default function AuctionReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <AuctionScope id={id}>{(auction) => <AuctionReports auctionId={auction.id} title={auction.title} />}</AuctionScope>
}
