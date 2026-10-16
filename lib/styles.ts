/** Shared visual recipes. Colors and layout stay on each element. */

export const eyebrow = 'text-[11px] font-semibold uppercase tracking-wide'
export const caption = 'text-[10px] font-semibold uppercase tracking-wide'

export const panel = 'rounded-3xl border border-border bg-surface'
export const panelSm = 'rounded-2xl border border-border bg-surface'

export const mobileMenuTrigger =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-md transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export function filterTriggerClass(active: boolean) {
  return `inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl border-0 bg-transparent px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`
}

export const btnPrimary =
  'flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground'

export const btnPrimaryMotion =
  'shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-[0.99]'

export const field =
  'w-full min-w-0 max-w-full rounded-xl border border-input bg-field px-3 py-2.5 text-sm text-foreground outline-none dark:bg-surface-2'

export const selectField =
  'app-select w-full min-w-0 max-w-full rounded-xl border border-input bg-field px-3 py-2.5 text-sm text-foreground outline-none dark:bg-surface-2'

export const selectCompactField =
  'app-select w-fit min-w-0 max-w-full rounded-lg bg-field px-3 py-1.5 text-sm font-semibold text-foreground outline-none dark:bg-background/50'
