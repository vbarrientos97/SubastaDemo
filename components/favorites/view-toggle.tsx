'use client'

import { Columns3, LayoutGrid } from 'lucide-react'
import type { FavoritesView } from '@/lib/favorites-view'
import { cn } from '@/lib/utils'

export function FavoritesViewToggle({
  value,
  onChange,
}: {
  value: FavoritesView
  onChange: (value: FavoritesView) => void
}) {
  const options: { key: FavoritesView; label: string; icon: typeof LayoutGrid }[] = [
    { key: 'grid', label: 'Cuadrícula', icon: LayoutGrid },
    { key: 'columns', label: 'Columnas', icon: Columns3 },
  ]

  return (
    <div
      className="hidden rounded-xl bg-surface-2 p-1 lg:inline-flex"
      role="group"
      aria-label="Vista de favoritos"
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = value === option.key
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition',
              active
                ? 'bg-black text-white shadow-sm dark:bg-surface dark:text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
