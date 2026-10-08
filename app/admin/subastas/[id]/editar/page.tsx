'use client'

import { use } from 'react'
import { AuctionEditor } from '@/components/admin/auction-admin'
import { AuctionScope } from '@/components/admin/auction-scope'

export default function AdminAuctionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <AuctionScope id={id}>
      {(auction) => <AuctionEditor key={auction.id} auction={auction} />}
    </AuctionScope>
  )
}
