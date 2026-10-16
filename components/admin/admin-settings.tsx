import { ThemeToggle } from '@/components/account/theme-toggle'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

/** AdminShell owns navigation; this view only renders administrator preferences. */
export function AdminSettings() {
  return (
    <section aria-labelledby="admin-settings-heading" className="flex w-full max-w-3xl flex-col gap-5">
      <h1 id="admin-settings-heading" className="font-display text-xl font-bold text-foreground">Ajustes</h1>
      <section aria-labelledby="admin-appearance-heading" className={cn(panel, 'p-4 sm:p-5')}>
        <h2 id="admin-appearance-heading" className="mb-2 text-base font-semibold text-foreground">Modo oscuro/claro</h2>
        <ThemeToggle className="-mx-1.5" />
      </section>
    </section>
  )
}
