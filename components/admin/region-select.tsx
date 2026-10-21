'use client'

import { Select } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { isRegionId, regions, type RegionId } from '@/lib/domain/region'
import { regionInk, regionInkClass } from '@/components/admin/region-ink'
import { cn } from '@/lib/utils'

type RegionFilter = RegionId | 'todos'

/** Custom select preserves region colors on mobile, unlike native option menus. */
export function RegionSelect({ value, onChange }: { value: RegionFilter; onChange: (value: RegionFilter) => void }) {
  const selected = regions.find((region) => region.id === value)
  return (
    <Select.Root value={value} onValueChange={(next) => {
      if (next === 'todos' || (typeof next === 'string' && isRegionId(next))) onChange(next)
    }}>
      <Select.Trigger aria-label="Filtrar por lugar" className={cn('flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-field px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', selected ? regionInkClass[regionInk[selected.id]] : 'text-foreground')}>
        <Select.Value>{selected?.name ?? 'Todos los lugares'}</Select.Value>
        <Select.Icon><ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} className="z-[110]" alignItemWithTrigger={false}>
          <Select.Popup className="max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-lg">
            <Select.List>
              {[{ id: 'todos', name: 'Todos los lugares' } as const, ...regions].map((region) => (
                <Select.Item key={region.id} value={region.id} className={cn('flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold outline-none data-highlighted:bg-accent', regionInkClass[region.id === 'todos' ? 'black' : regionInk[region.id]])}>
                  <Select.ItemText className="flex-1">{region.name}</Select.ItemText>
                  <Select.ItemIndicator><Check aria-hidden="true" className="h-4 w-4" /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
