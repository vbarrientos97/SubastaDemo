'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Settings, User, UserRound } from 'lucide-react'
import { buyer } from '@/lib/data/buyer'
import { ThemeToggle } from '@/components/account/theme-toggle'
import { useSession } from '@/components/auth/session-provider'
import { panelSm } from '@/lib/styles'
import { cn } from '@/lib/utils'

const links = [
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/cuenta', label: 'Mi cuenta', icon: UserRound },
  { href: '/ajustes', label: 'Ajustes', icon: Settings },
]

export function AccountDrawerSection({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, user, signOut } = useSession()

  if (!ready) return null

  if (!user) {
    return (
      <div className="border-t border-border p-3">
        <Link
          href="/entrar"
          onClick={onNavigate}
          className="flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
        >
          Ingresar
        </Link>
      </div>
    )
  }

  const visibleLinks = user.role === 'admin'
    ? links.filter((item) => item.href === '/cuenta')
    : links

  return (
    <div className="border-t border-border p-3">
      <div className="mb-2 flex items-center gap-3 px-3 py-2">
        <img
          src={buyer.photo}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover object-[center_20%] ring-1 ring-foreground/10"
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">{user.username}</span>
          <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
        </span>
      </div>
      {visibleLinks.map((item) => {
        const Icon = item.icon
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(event) => {
              event.preventDefault()
              onNavigate()
              router.push(item.href)
            }}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold',
              active ? 'bg-primary/10 text-primary' : 'text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
      <div className="my-1 border-t border-border" />
      <ThemeToggle />
      <button
        type="button"
        onClick={() => {
          onNavigate()
          signOut()
          router.push('/entrar')
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  )
}

export function ProfileMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, user, signOut } = useSession()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const photo = buyer.photo

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!ready) {
    return <span className="h-10 w-10 shrink-0 rounded-full bg-surface-2" aria-hidden />
  }

  if (!user) {
    return (
      <Link
        href="/entrar"
        className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:brightness-110"
      >
        Ingresar
      </Link>
    )
  }

  const visibleLinks = user.role === 'admin'
    ? links.filter((item) => item.href === '/cuenta')
    : links

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Abrir menú de cuenta"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-foreground/10 transition hover:ring-foreground/25"
      >
        <img
          src={photo}
          alt=""
          className="h-full w-full object-cover object-[center_20%]"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(panelSm, 'absolute right-0 top-12 z-50 w-56 p-1.5 shadow-lg')}
        >
          {visibleLinks.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          <div className="my-1 border-t border-border" />
          <ThemeToggle />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              signOut()
              router.push('/entrar')
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  )
}
