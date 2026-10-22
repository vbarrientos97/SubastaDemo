'use client'

import { cn } from '@/lib/utils'
import { field } from '@/lib/styles'
import type { AuctionStatus } from '@/lib/domain/auction'

export const emptyAuctionDraft = {
  title: '',
  location: '',
  seller: '',
  dates: '',
  startAt: '',
  endAt: '',
  status: 'creada' as AuctionStatus,
}

export function AuctionFields({
  draft,
  onChange,
  locked = false,
}: {
  draft: typeof emptyAuctionDraft
  onChange: (next: typeof emptyAuctionDraft) => void
  locked?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground md:col-span-2">
        Título
        <input
          value={draft.title}
          onChange={(event) => onChange({ ...draft, title: event.target.value })}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Lugar
        <input
          value={draft.location}
          onChange={(event) => onChange({ ...draft, location: event.target.value })}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Vendedor
        <input
          value={draft.seller ?? ''}
          onChange={(event) => onChange({ ...draft, seller: event.target.value })}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Desde
        <input
          type="datetime-local"
          disabled={locked}
          value={draft.startAt ?? ''}
          onChange={(event) => onChange({ ...draft, startAt: event.target.value })}
          className={cn(field, locked && 'cursor-not-allowed opacity-60')}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Hasta
        <input
          type="datetime-local"
          disabled={locked}
          value={draft.endAt ?? ''}
          onChange={(event) => onChange({ ...draft, endAt: event.target.value })}
          className={cn(field, locked && 'cursor-not-allowed opacity-60')}
        />
      </label>
    </div>
  )
}
