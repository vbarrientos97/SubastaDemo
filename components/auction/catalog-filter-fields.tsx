'use client'

import { Search } from 'lucide-react'
import { categoryLabel, type SexFilter } from '@/lib/domain/lot'
import { caption } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function LotSearch({
  value,
  onChange,
  framed,
}: {
  value: string
  onChange: (value: string) => void
  framed?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 items-center gap-2.5',
        framed ? 'rounded-xl border border-input bg-field px-3.5 py-2.5 dark:bg-surface' : 'px-2',
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por lote, raza…"
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Buscar lotes"
      />
    </div>
  )
}

export function SexFilters({
  value,
  onChange,
  counts,
  variant,
  className,
}: {
  value: SexFilter
  onChange: (value: SexFilter) => void
  counts: { todos: number; hembra: number; macho: number }
  className?: string
  variant: 'segmented' | 'chips'
}) {
  const filters: { key: SexFilter; label: string }[] = [
    { key: 'todos', label: `Todos (${counts.todos})` },
    { key: 'hembra', label: `${categoryLabel('hembra')} (${counts.hembra})` },
    { key: 'macho', label: `${categoryLabel('macho')} (${counts.macho})` },
  ]

  return (
    <div
      className={cn(
        variant === 'segmented'
          ? 'flex shrink-0 items-center rounded-xl bg-background/50 p-1'
          : 'grid min-w-0 grid-cols-3 gap-1',
        className,
      )}
      role="group"
      aria-label="Sexo"
    >
      {filters.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          aria-pressed={value === item.key}
          className={cn(
            'font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            variant === 'segmented'
              ? 'rounded-lg px-3 py-1.5 text-sm'
              : 'min-h-11 min-w-0 break-words rounded-full px-1.5 py-1.5 text-xs',
            value === item.key
              ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground'
              : variant === 'segmented'
                ? 'text-muted-foreground hover:text-foreground'
                : 'bg-surface-2 text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function PriceFields({
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  layout,
}: {
  minPrice: string
  maxPrice: string
  onMinPrice: (value: string) => void
  onMaxPrice: (value: string) => void
  layout: 'row' | 'grid'
}) {
  const fields = [
    { label: 'Desde', value: minPrice, onChange: onMinPrice, aria: 'Precio mínimo', placeholder: 'mín' },
    { label: 'Hasta', value: maxPrice, onChange: onMaxPrice, aria: 'Precio máximo', placeholder: 'máx' },
  ]

  const inputs = fields.map((field) => (
    <label
      key={field.label}
      className={cn(
        'flex items-center gap-2',
        layout === 'grid' && 'rounded-xl border border-input bg-field px-3 py-2 dark:bg-surface',
      )}
    >
      <span className={cn(caption, 'shrink-0 text-muted-foreground')}>{field.label}</span>
      <span className="text-sm font-semibold text-muted-foreground">$</span>
      <input
        inputMode="numeric"
        value={field.value}
        onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ''))}
        placeholder={field.placeholder}
        aria-label={field.aria}
        className={cn(
          'bg-transparent text-sm font-semibold tabular text-foreground outline-none placeholder:text-muted-foreground dark:placeholder:text-muted-foreground/50',
          layout === 'grid' ? 'w-full' : 'w-20',
        )}
      />
    </label>
  ))

  if (layout === 'row') {
    return (
      <div className="flex items-center gap-2">
        {inputs[0]}
        <span className="text-muted-foreground" aria-hidden>
          —
        </span>
        {inputs[1]}
      </div>
    )
  }

  return <div className="grid grid-cols-2 gap-2">{inputs}</div>
}
