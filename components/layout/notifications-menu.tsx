'use client'

import { useEffect, useRef, useState } from 'react'
import { BellRing, Clock, Gavel, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { panelSm } from '@/lib/styles'

const alerts = [
  { icon: Gavel, tone: 'primary', title: 'Te superaron en Lote 01', body: 'Mister Tolé 334/2 — nueva puja líder de $10,000 USD.', time: 'hace 1 min', unread: true },
  { icon: Clock, tone: 'warning', title: 'Cierre inminente · Lote 01', body: 'Tiempo extendido activo. Quedan menos de 30 segundos.', time: 'hace 2 min', unread: true },
  { icon: Trophy, tone: 'success', title: '¡Adjudicado! Lote 03', body: 'Vaquilla Nelore Élite cerró en $2,100 USD (Paleta #42).', time: 'hace 34 min', unread: false },
  { icon: BellRing, tone: 'muted', title: 'Recordatorio de apertura', body: 'Lote Terneros Brangus Negro abre mañana a las 10:00 AM.', time: 'hace 1 h', unread: false },
]

const toneMap: Record<string, string> = {
  primary: 'bg-primary/15 text-primary',
  warning: 'bg-warning/15 text-warning',
  success: 'bg-success/15 text-success',
  muted: 'bg-surface-2 text-muted-foreground',
}

export function NotificationsMenu({ variant = 'desktop' }: { variant?: 'desktop' | 'dock' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const dock = variant === 'dock'

  useEffect(() => {
    if (!open) return
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', dock && 'flex-1')}>
      <button
        type="button"
        aria-label="Notificaciones"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'relative transition-colors',
          dock
            ? 'flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground'
            : 'inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        <span className="relative">
          <BellRing className={cn(dock ? 'h-[22px] w-[22px]' : 'h-5 w-5')} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </span>
        {dock ? 'Notificaciones' : null}
      </button>

      {open ? (
        <section
          role="dialog"
          aria-label="Notificaciones recientes"
          className={cn(
            panelSm,
            'fixed z-[70] flex max-h-[min(70vh,34rem)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden shadow-2xl',
            dock ? 'bottom-20 left-1/2 -translate-x-1/2' : 'right-3 top-14 sm:right-6 lg:fixed lg:right-6 lg:top-[4.5rem]',
          )}
        >
          <header className="border-b border-border px-4 py-3">
            <h2 className="font-display text-base font-bold text-foreground">Notificaciones</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Actividad de tus pujas</p>
          </header>
          <ul className="overflow-y-auto">
            {alerts.map((alert, index) => {
              const Icon = alert.icon
              return (
                <li key={index} className={cn('flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0', alert.unread && 'bg-primary/[0.035]')}>
                  <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', toneMap[alert.tone])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="min-w-0 flex-1 font-semibold leading-snug text-foreground">{alert.title}</span>
                      {alert.unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{alert.body}</span>
                    <span className="mt-1.5 block text-[11px] font-medium text-muted-foreground">{alert.time}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
