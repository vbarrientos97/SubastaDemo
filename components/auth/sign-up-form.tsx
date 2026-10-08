'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { regions } from '@/lib/domain/region'
import { btnPrimary, btnPrimaryMotion, eyebrow, field, panel, selectField } from '@/lib/styles'
import { cn } from '@/lib/utils'

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

export function SignUpForm() {
  const { register } = useSession()
  const router = useRouter()
  const search = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [paddle, setPaddle] = useState('')
  const [regionId, setRegionId] = useState(regions[0].id)
  const [error, setError] = useState<string | null>(null)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const message = register({ name, email, password, paddle, regionId })
    if (message) {
      setError(message)
      return
    }
    router.push(safeNext(search.get('next')))
  }

  return (
    <form onSubmit={submit} className={cn(panel, 'flex flex-col gap-4 p-5')}>
      <div>
        <p className={cn(eyebrow, 'text-primary')}>Comprador</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground">Crear cuenta</h1>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Nombre
        <input value={name} onChange={(event) => setName(event.target.value)} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Correo
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Paleta
        <input
          inputMode="numeric"
          value={paddle}
          onChange={(event) => setPaddle(event.target.value)}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Región de envío
        <select
          value={regionId}
          onChange={(event) => setRegionId(event.target.value as typeof regionId)}
          className={selectField}
        >
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="text-sm font-medium text-primary">{error}</p> : null}

      <button type="submit" className={cn(btnPrimary, btnPrimaryMotion)}>
        Registrarme
      </button>
      <p className="text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/entrar" className="font-semibold text-primary">
          Ingresar
        </Link>
      </p>
    </form>
  )
}
