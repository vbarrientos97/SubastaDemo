import type { RegionId } from '@/lib/domain/region'

export type RegionInk = 'green' | 'red' | 'blue' | 'black'
export const regionInk: Record<RegionId, RegionInk> = { boqueron: 'green', azuero: 'red', torti: 'blue', cocle: 'black' }

export const regionInkClass: Record<RegionInk, string> = {
  green: 'text-success dark:text-emerald-400',
  red: 'text-destructive dark:text-red-400',
  blue: 'text-blue-700 dark:text-blue-400',
  black: 'text-foreground',
}

/** Marker colors for the light projection board. Ignore the app theme. */
export const regionBoardInkClass: Record<RegionInk, string> = {
  green: 'text-success dark:text-emerald-600',
  red: 'text-destructive dark:text-red-600',
  blue: 'text-blue-700',
  black: 'text-foreground dark:text-neutral-950',
}

export const regionSwatchClass: Record<RegionInk, string> = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  black: 'bg-foreground',
}

export const regionChipClass: Record<RegionInk, { idle: string; active: string }> = {
  green: {
    idle: 'border border-emerald-500/80 bg-emerald-500/10 text-success dark:text-emerald-400',
    active: 'border border-success bg-success text-success-foreground dark:border-emerald-500 dark:bg-emerald-500 dark:text-white',
  },
  red: {
    idle: 'border border-red-500/80 bg-red-500/10 text-destructive dark:text-red-400',
    active: 'border border-destructive bg-destructive text-primary-foreground dark:border-red-500 dark:bg-red-500 dark:text-white',
  },
  blue: {
    idle: 'border border-blue-500/80 bg-blue-500/10 text-blue-400',
    active: 'border border-blue-500 bg-blue-500 text-white',
  },
  black: {
    idle: 'border border-foreground/50 bg-foreground/10 text-foreground',
    active: 'border border-foreground bg-foreground text-background',
  },
}
