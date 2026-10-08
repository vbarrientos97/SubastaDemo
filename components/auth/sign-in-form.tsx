'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, User } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

const inputClass =
  'h-[52px] w-full rounded-full border bg-white pr-5 pl-12 text-[15px] font-normal text-[#0c3d28] outline-none placeholder:text-[#6d8a7a] border-[#efe4d4] focus-visible:border-[#0c3d28] dark:border-[#8d7b4a] dark:bg-[#141816] dark:text-white dark:placeholder:text-[#8e968e] focus-visible:dark:border-[#d4c48a]'

export function SignInForm() {
  const { signIn } = useSession()
  const router = useRouter()
  const search = useSearchParams()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = search.get('next')
  const registroHref = next ? `/registro?next=${encodeURIComponent(safeNext(next))}` : '/registro'

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const result = signIn(login, password)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push(result.role === 'admin' ? '/admin' : safeNext(next))
  }

  return (
    <div>
      <form
        onSubmit={submit}
        className="flex flex-col rounded-[28px] border border-[#c9962e] bg-[#e2b04a] px-8 py-7 shadow-[0_22px_50px_rgba(70,40,20,0.16)] dark:border-white/10 dark:bg-[#1c211ef2] dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
      >
        <h1 className="mb-6 text-center text-[1.35rem] font-semibold tracking-tight text-[#0c3d28] dark:text-white">
          Iniciar sesión para continuar
        </h1>

        <label className="mb-3.5">
          <span className="sr-only">Nombre de usuario o correo electrónico</span>
          <span className="relative block">
            <User aria-hidden className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-[#0c3d28] dark:text-[#9aa396]" />
            <input
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoComplete="username"
              placeholder="Nombre de usuario/Correo electrónico"
              className={inputClass}
            />
          </span>
        </label>

        <label className="mb-4">
          <span className="sr-only">Contraseña</span>
          <span className="relative block">
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute top-1/2 left-3.5 inline-flex -translate-y-1/2 text-[#0c3d28] hover:text-[#0c3d28] dark:text-[#9aa396] dark:hover:text-white"
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Contraseña"
              className={inputClass}
            />
          </span>
        </label>

        {error ? <p className="mb-4 text-sm font-medium text-[#9a3040] dark:text-[#ffb4b4]">{error}</p> : null}

        <div className="mb-5 flex items-center justify-between gap-3 text-[15px] text-[#0c3d28] dark:text-[#d7ddd6]">
          <label className="inline-flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" className="peer sr-only" />
            <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border border-[#c4b5a8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#7a3038]/40 peer-checked:[&>span]:scale-100 dark:border-[#d5ddd4] dark:peer-focus-visible:ring-white/50">
              <span className="h-2 w-2 scale-0 rounded-full bg-[#0c3d28] transition-transform dark:bg-white" />
            </span>
            Recuérdame
          </label>
          <button type="button" className="transition hover:brightness-125 dark:hover:text-white">
            ¿Olvidó su contraseña?
          </button>
        </div>

        <button
          type="submit"
          className="flex h-[52px] items-center justify-center rounded-full bg-[#0c3d28] text-[15px] font-semibold text-white transition hover:brightness-125 dark:bg-primary dark:text-primary-foreground dark:hover:brightness-110"
        >
          Iniciar sesión
        </button>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-[#0c3d28] dark:text-[#b7beb6]">
            o{' '}
            <Link href={registroHref} className="font-semibold underline-offset-2 hover:underline dark:hover:text-white">
              regístrese
            </Link>{' '}
            usando
          </p>
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-[#1877F2] text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M14.5 8.5V6.8c0-.7.5-1 1.1-1H17V3h-2.1C12.4 3 11 4.5 11 6.6v1.9H9v2.7h2V21h3v-9.8h2.2l.3-2.7h-2.5z" />
              </svg>
            </span>
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-[#1DA1F2] text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                <path d="M21.5 6.2c-.6.3-1.3.5-2 .5.7-.4 1.3-1.1 1.5-1.9-.7.4-1.4.7-2.2.9A3.5 3.5 0 0 0 12 8.6c0 .3 0 .5.1.8-2.8-.1-5.3-1.5-7-3.6-.3.5-.5 1.1-.5 1.8 0 1.2.6 2.2 1.5 2.8-.6 0-1.1-.2-1.6-.4 0 1.7 1.2 3.1 2.8 3.4-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.4 1.7 2.4 3.2 2.4A7 7 0 0 1 3 17.5a9.8 9.8 0 0 0 5.3 1.6c6.4 0 9.9-5.3 9.9-9.9v-.4c.7-.5 1.3-1.1 1.8-1.8z" />
              </svg>
            </span>
          </div>
        </div>
      </form>
      <p className="mt-4 text-center text-[11px] text-[#0c3d28] dark:text-[#9aa396]">
        Demostración: admin / admin · carlos / carlos
      </p>
    </div>
  )
}
