'use client'

import { MapPin, ShieldCheck } from 'lucide-react'
import { buyer } from '@/lib/data/buyer'
import { regionById } from '@/lib/domain/region'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { RequireAuth } from '@/components/auth/require-auth'
import { useSession } from '@/components/auth/session-provider'
import { TopBar } from '@/components/layout/top-bar'

function PerfilContent() {
  const { client, user } = useSession()
  const person = client
    ? {
        name: client.name,
        photo: buyer.photo,
        verified: 'Comprador verificado',
        paddle: `#${client.paddle}`,
        location: regionById(client.regionId).name,
      }
    : {
        name: 'Administrador',
        photo: buyer.photo,
        verified: 'Acceso de administración',
        paddle: '—',
        location: 'Panel',
      }

  return (
    <>
      {user?.role === 'admin' ? null : <TopBar title="Perfil" subtitle={person.name} />}

      <main className="flex flex-col gap-5 px-4 py-4 lg:mx-auto lg:max-w-3xl lg:px-6 lg:py-8">
        {user?.role === 'admin' ? <h1 className="font-display text-xl font-bold text-foreground">Perfil</h1> : null}
        <section className={cn(panel, 'flex flex-col items-center gap-4 px-4 py-8 text-center')}>
          <img
            src={person.photo}
            alt={person.name}
            className="h-28 w-28 rounded-full object-cover object-[center_20%] ring-1 ring-foreground/10"
          />
          <div>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{person.name}</h2>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-success">
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
          <section className={cn(panel, 'overflow-hidden')}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <span className="text-sm text-muted-foreground">Paleta</span>
              <span className="text-sm font-semibold text-foreground">{person.paddle}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Subasta
              </span>
              <span className="text-sm font-semibold text-foreground">{person.location}</span>
            </div>
          </section>
        )}
      </main>
    </>
  )
}

export default function PerfilPage() {
  return (
    <RequireAuth next="/perfil">
      <PerfilContent />
    </RequireAuth>
  )
}
