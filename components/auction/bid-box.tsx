'use client'

import { useEffect, useState } from 'react'
import { Gavel, Plus, Check } from 'lucide-react'
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
  const [bid, setBid] = useState(currentBid)
  const [custom, setCustom] = useState<string>(String(currentBid + minIncrement))
  const [justPlaced, setJustPlaced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextQuick = bid + minIncrement
  const parsedCustom = Number.parseInt(custom.replace(/\D/g, ''), 10)
  const isCustomValid = Number.isFinite(parsedCustom) && parsedCustom > bid

  useEffect(() => {
    setBid(currentBid)
    setCustom(String(currentBid + minIncrement))
  }, [currentBid, minIncrement])

  function place(amount: number) {
    if (amount <= currentBid) return
    const message = onPlace(amount)
    setError(message)
    if (message) return
    setJustPlaced(true)
    window.setTimeout(() => setJustPlaced(false), 1800)
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

        <label className={cn('flex items-center rounded-xl border border-input bg-surface-2', lg ? 'px-3 py-2' : 'px-2.5 py-1.5')}>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase leading-5 tracking-wide text-muted-foreground">
              Otro monto
            </span>
            <span className="flex h-6 items-center gap-0.5">
              <span className="text-base font-bold leading-6 text-muted-foreground">$</span>
              <input
                inputMode="numeric"
                value={custom ? Number(custom.replace(/\D/g, '')).toLocaleString('en-US') : ''}
                onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))}
                className="h-6 w-full border-0 bg-transparent p-0 text-base font-bold leading-6 tabular text-foreground outline-none"
                aria-label="Ingresar otro monto de puja"
              />
            </span>
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={() => place(isCustomValid ? parsedCustom : nextQuick)}
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
              · ${formatUSD(isCustomValid ? parsedCustom : nextQuick)}
            </span>
          </>
        )}
      </button>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  )
}
