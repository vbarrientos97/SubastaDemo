'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Popover } from '@base-ui/react/popover'
import { cn } from '@/lib/utils'

export type DateRange = { from: string; to: string }

const spanishMonths = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' })
const shortMonths = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(value: string) {
  const date = fromDateKey(value)
  return `${date.getDate()} ${shortMonths[date.getMonth()]} ${date.getFullYear()}`
}

function accessibleDate(value: Date) {
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'long' }).format(value)
}

export function AuctionDateFilter({ value, onChange, fieldClassName }: {
  value: DateRange | null
  onChange: (value: DateRange | null) => void
  fieldClassName: string
}) {
  const [month, setMonth] = useState(() => {
    const date = value?.from ? fromDateKey(value.from) : new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })

  const calendarDays = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    const mondayOffset = (firstDay.getDay() + 6) % 7
    const gridStart = new Date(firstDay)
    gridStart.setDate(firstDay.getDate() - mondayOffset)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + index)
      return date
    })
  }, [month])

  function selectDate(date: Date) {
    const selected = dateKey(date)
    if (!value || value.from !== value.to) {
      onChange({ from: selected, to: selected })
      return
    }
    if (selected === value.from) return
    onChange(selected < value.from
      ? { from: selected, to: value.from }
      : { from: value.from, to: selected })
  }

  const displayValue = value
    ? value.from === value.to
      ? formatDate(value.from)
      : `${formatDate(value.from)} – ${formatDate(value.to)}`
    : ''

  return (
    <div className="relative min-w-0">
      <Popover.Root>
        <Popover.Trigger className={cn(fieldClassName, 'flex items-center gap-2 text-left')} aria-label={displayValue ? `Fecha: ${displayValue}` : 'Filtrar por fecha'}>
          <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className={cn('min-w-0 flex-1 truncate', !displayValue && 'text-muted-foreground')}>
            {displayValue || 'Filtrar por fecha'}
          </span>
        </Popover.Trigger>
        {value ? (
          <button type="button" onClick={() => onChange(null)} aria-label="Limpiar filtro de fecha" className="absolute right-1 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
            <Popover.Popup className="w-[min(340px,calc(100vw-24px))] rounded-2xl border border-border bg-surface p-3 text-foreground shadow-xl outline-none">
              <div className="mb-3 flex items-center justify-between gap-2">
                <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mes anterior" className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <p className="text-sm font-bold capitalize">{spanishMonths.format(month)}</p>
                <div className="flex items-center">
                  <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Mes siguiente" className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); const key = dateKey(today); onChange({ from: key, to: key }) }} className="min-h-10 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-accent">
                    Hoy
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
                {weekdays.map((day, index) => <span key={`${day}-${index}`} className="py-2">{day}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map((date) => {
                  const key = dateKey(date)
                  const selected = Boolean(value && key >= value.from && key <= value.to)
                  const endpoint = Boolean(value && (key === value.from || key === value.to))
                  return (
                    <button key={key} type="button" onClick={() => selectDate(date)} aria-pressed={endpoint} aria-label={accessibleDate(date)} className={cn('mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', date.getMonth() !== month.getMonth() && 'text-muted-foreground/60', selected && 'bg-primary/10', endpoint && 'bg-primary font-bold text-primary-foreground hover:bg-primary')}>
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">Toca un día o elige dos para un rango.</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
