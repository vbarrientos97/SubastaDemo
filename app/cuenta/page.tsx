'use client'

import {
  CreditCard,
  Gavel,
  FileText,
  ShieldCheck,
  Bell,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { buyer } from '@/lib/data/buyer'
import { eyebrow, panel, panelSm } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { TopBar } from '@/components/layout/top-bar'
import { RequireAuth } from '@/components/auth/require-auth'
import { useSession } from '@/components/auth/session-provider'

const menu = [
  { icon: Gavel, label: 'Mis pujas activas', hint: '2 en curso' },
  { icon: FileText, label: 'Historial de adjudicaciones' },
  { icon: CreditCard, label: 'Métodos de pago' },
  { icon: Bell, label: 'Preferencias de notificaciones' },
  { icon: ShieldCheck, label: 'Verificación de comprador', hint: 'Verificado' },
]

function CuentaContent() {
  const { client, user, signOut } = useSession()
  const router = useRouter()

  const person = client
    ? {
        name: client.name,
        paddle: `#${client.paddle}`,
        photo: buyer.photo,
        verified: 'Comprador verificado',
      }
    : {
        name: 'Administrador',
        paddle: '—',
        photo: buyer.photo,
        verified: 'Acceso de administración',
      }

  const stats = [
    { label: 'Paleta', value: person.paddle },
    { label: 'Pujas', value: client ? buyer.bids : '—' },
    { label: 'Ganados', value: client ? buyer.won : '—' },
  ]

  function leave() {
    signOut()
    router.push('/entrar')
  }

  return (
    <>
      {user?.role === 'admin' ? null : <TopBar title="Mi Cuenta" subtitle={person.verified} />}

      <main className="flex flex-col gap-5 px-4 py-4 lg:mx-auto lg:max-w-3xl lg:px-6 lg:py-8">
        {user?.role === 'admin' ? <h1 className="font-display text-xl font-bold text-foreground">Mi Cuenta</h1> : null}
        <section className={cn(panel, 'flex items-center gap-4 p-4')}>
          <img
            src={person.photo}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl object-cover object-[center_20%] ring-1 ring-foreground/10"
          />
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-bold text-foreground">
              {person.name}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-success">
              <ShieldCheck className="h-4 w-4" />
              {person.verified}
            </p>
          </div>
        </section>

        {user?.role === 'admin' ? (
          <section className={cn(panel, 'overflow-hidden')}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <span className="text-sm text-muted-foreground">Usuario</span>
              <span className="text-sm font-semibold text-foreground">{user.username}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-muted-foreground">Correo</span>
              <span className="text-sm font-semibold text-foreground">{user.email}</span>
            </div>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className={cn(panelSm, 'p-3 text-center')}>
                  <span className="block font-display text-lg font-bold text-foreground sm:text-xl">{s.value}</span>
                  <span className={cn(eyebrow, 'text-muted-foreground')}>{s.label}</span>
                </div>
              ))}
            </section>

            <section className={cn(panel, 'overflow-hidden')}>
              {menu.map((item, i) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-accent ${
                      i !== menu.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                    {item.hint && (
                      <span className="text-[11px] font-semibold text-muted-foreground">{item.hint}</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )
              })}
            </section>
          </>
        )}

        <button
          type="button"
          onClick={leave}
          className={cn(
            panelSm,
            'flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-primary transition hover:bg-accent',
          )}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </main>
    </>
  )
}

export default function CuentaPage() {
  return (
    <RequireAuth next="/cuenta">
      <CuentaContent />
    </RequireAuth>
  )
}
