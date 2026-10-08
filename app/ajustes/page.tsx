'use client'

import { Bell, Gavel, ShieldCheck } from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { useSession } from '@/components/auth/session-provider'
import { TopBar } from '@/components/layout/top-bar'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

const items = [
  { icon: Gavel, label: 'Avisos de puja', hint: 'Cuando te superan' },
  { icon: Bell, label: 'Cierres de lote', hint: 'Antes de que cierre' },
  { icon: ShieldCheck, label: 'Verificación de comprador', hint: 'Verificado' },
]

function AjustesContent() {
  const { user } = useSession()

  return (
    <>
      {user?.role === 'admin' ? null : <TopBar title="Ajustes" subtitle="Tu cuenta" />}

      <main className="flex flex-col gap-5 px-4 py-4 lg:mx-auto lg:max-w-3xl lg:px-6 lg:py-8">
        {user?.role === 'admin' ? <h1 className="font-display text-xl font-bold text-foreground">Ajustes</h1> : null}
        {user?.role === 'admin' ? (
          <section className={cn(panel, 'p-4')}>
            <h2 className="font-display text-base font-bold text-foreground">Ajustes de administración</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              En este demo no hay preferencias específicas para administradores. Puedes cambiar la apariencia desde el menú de usuario.
            </p>
          </section>
        ) : (
          <section className={cn(panel, 'overflow-hidden')}>
            {items.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i !== items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-[11px] font-semibold text-muted-foreground">{item.hint}</span>
                </div>
              )
            })}
          </section>
        )}
      </main>
    </>
  )
}

export default function AjustesPage() {
  return (
    <RequireAuth next="/ajustes">
      <AjustesContent />
    </RequireAuth>
  )
}
