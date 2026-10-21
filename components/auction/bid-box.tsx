'use client'

import { useEffect, useRef, useState } from 'react'
import { Gavel, Plus, Check } from 'lucide-react'
import { validateBidAmount } from '@/lib/domain/lot'
import { formatUSD } from '@/lib/format'
import { btnPrimary, btnPrimaryMotion } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function BidBox({
  currentBid,
  minIncrement,
  size = 'md',
  onPlace,
}: {
  currentBid: number
  minIncrement: number
  size?: 'md' | 'lg'
  onPlace: (amount: number) => string | null
}) {
  const [custom, setCustom] = useState('')
  const [justPlaced, setJustPlaced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timer = useRef<number | null>(null)
  const nextQuick = currentBid + minIncrement
  const parsedCustom = Number.parseInt(custom.replace(/\D/g, ''), 10)
  const amount = custom ? parsedCustom : nextQuick
  const amountError = validateBidAmount({ currentBid, minIncrement }, amount)

  useEffect(() => {
    return () => { if (timer.current !== null) window.clearTimeout(timer.current) }
  }, [])

  function place(amount: number) {
    const message = validateBidAmount({ currentBid, minIncrement }, amount) ?? onPlace(amount)
    setError(message)
    if (message) return
    setJustPlaced(true)
    setCustom('')
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setJustPlaced(false), 1800)
  }

  const lg = size === 'lg'

  return (
    <div className={cn('flex flex-col', lg ? 'gap-2.5' : 'gap-2')}>
      <div className={cn('grid grid-cols-2 items-stretch', lg ? 'gap-2.5' : 'gap-2')}>
        <button
          type="button"
          onClick={() => place(nextQuick)}
          className={cn(
            'flex items-center rounded-xl border border-success/30 bg-success/10 text-left transition hover:bg-success/15 active:scale-[0.98]',
            lg ? 'gap-2.5 px-3 py-2' : 'gap-2 px-2.5 py-1.5',
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
            <Plus className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-5 text-success">
              +${formatUSD(minIncrement)}
            </span>
            <span className="block text-[11px] font-semibold leading-4 tabular text-muted-foreground">
              ${formatUSD(nextQuick)}
            </span>
          </span>
        </button>

          <label className={cn('flex items-center rounded-xl border border-input bg-field dark:bg-surface-2', lg ? 'px-3 py-2' : 'px-2.5 py-1.5')}>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase leading-5 tracking-wide text-muted-foreground">
              Otro monto
            </span>
            <span className="flex h-6 items-center gap-0.5">
              <span className="text-base font-bold leading-6 text-muted-foreground">$</span>
              <input
                inputMode="numeric"
                placeholder={String(nextQuick)}
                aria-invalid={!!custom && !!amountError}
                value={custom ? Number(custom.replace(/\D/g, '')).toLocaleString('en-US') : ''}
                onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))}
                className="h-6 w-full border-0 bg-transparent p-0 text-base font-bold leading-6 tabular text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Ingresar otro monto de puja"
              />
            </span>
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={() => place(amount)}
        className={cn(
          btnPrimary,
          btnPrimaryMotion,
          lg && 'py-4 text-base',
          justPlaced && 'bg-success text-success-foreground shadow-success/25',
        )}
      >
        {justPlaced ? (
          <>
            <Check className={cn(lg ? 'h-5 w-5' : 'h-4 w-4')} />
            ¡Puja registrada!
          </>
        ) : (
          <>
            <Gavel className={cn(lg ? 'h-5 w-5' : 'h-4 w-4')} />
            <span>Pujar ahora</span>
            <span className="tabular">
              · ${formatUSD(amount)}
            </span>
          </>
        )}
      </button>
      {error ? <p role="alert" className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  )
}
