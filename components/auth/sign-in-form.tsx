'use client'

import { safeInternalPath as safeNext } from '@/lib/internal-path'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { BackLink } from '@/components/layout/back-link'

const inputClass =
  'h-[52px] w-full rounded-full border bg-field pr-5 pl-12 text-[15px] font-normal text-foreground outline-none placeholder:text-muted-foreground border-border focus-visible:border-ring dark:border-[#8d7b4a] dark:bg-[#141816] dark:text-white dark:placeholder:text-[#8e968e] focus-visible:dark:border-[#d4c48a]'

export function SignInForm() {
  const { signIn, state } = useSession()
  const router = useRouter()
  const search = useSearchParams()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const next = search.get('next')
  function submit(event: React.FormEvent) {
    event.preventDefault()
    const lotMatch = next?.match(/^\/lote\/([^/?]+)/)
    const nextLot = lotMatch ? state?.lots.find((lot) => lot.id === lotMatch[1]) : null
    const auctionMatch = next?.match(/^\/subasta\/([^/?]+)/)
    const result = signIn(login, password, nextLot?.auctionId ?? auctionMatch?.[1] ?? null)
    if (result.error) {
      setError(result.error)
      return
    }
    router.replace(result.role === 'admin' ? '/admin' : (next ? safeNext(next) : result.homePath))
  }

  return (
    <div>
      <form
        onSubmit={submit}
        className="flex flex-col rounded-[28px] border border-border bg-card px-8 py-7 shadow-[var(--shadow-login)] dark:border-white/10 dark:bg-[#1c211ef2] dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
      >
        <h1 className="mb-6 text-center text-[1.35rem] font-semibold tracking-tight text-foreground dark:text-white">
          Iniciar sesión para continuar
        </h1>

        <label className="mb-3.5">
          <span className="sr-only">Nombre de usuario o correo electrónico</span>
          <span className="relative block">
            <User aria-hidden className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground dark:text-[#9aa396]" />
            <input
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoComplete="username"
              placeholder="Usuario"
              className={inputClass}
              required
            />
          </span>
        </label>

        <label className="mb-4">
          <span className="sr-only">Contraseña</span>
          <span className="relative block">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Contraseña"
              className={inputClass}
              required
            />
          </span>
        </label>

        {error ? <p role="alert" className="mb-4 text-sm font-medium text-destructive dark:text-[#ffb4b4]">{error}</p> : null}

        <button
          type="submit"
          className="flex h-[52px] items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground transition hover:bg-primary-hover dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:brightness-110"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}

export function SignInBackLink() {
  const { state } = useSession()
  const search = useSearchParams()
  const next = search.get('next')
  const lotMatch = next?.match(/^\/lote\/([^/?]+)/)
  const nextLot = lotMatch ? state?.lots.find((lot) => lot.id === lotMatch[1]) : null
  const auctionMatch = next?.match(/^\/subasta\/([^/?]+)/)
  const backHref = nextLot ? `/subasta/${nextLot.auctionId}` : auctionMatch ? `/subasta/${auctionMatch[1]}` : '/'

  return (
    <BackLink
      href={backHref}
      className="fixed left-4 top-4 z-[60] bg-card/90 text-foreground shadow-sm dark:bg-[#141816]/90 dark:text-white md:absolute md:left-4 md:top-4"
    />
  )
}
