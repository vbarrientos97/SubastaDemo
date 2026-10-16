'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { LogOut, Settings } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { cn } from '@/lib/utils'

export function AccountDrawerSection({ onNavigate, collapsed = false }: { onNavigate: () => void; collapsed?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { ready, user, signOut } = useSession()

  if (!ready) return null

  if (!user) {
    return (
      <div className="border-t border-border p-3">
        <Link
          href={`/entrar${/^\/(?:subasta\/[^/]+|lote\/[^/]+)$/.test(pathname) ? `?next=${encodeURIComponent(pathname)}` : ''}`}
          onClick={onNavigate}
          className="flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
        >
          Ingresar
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('mt-auto p-3', collapsed && 'px-1.5')}>
      <Link href="/ajustes" title={collapsed ? 'Ajustes' : undefined} onClick={onNavigate} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground', collapsed && 'justify-center px-0')}>
        <Settings className="h-5 w-5 shrink-0" />
        {collapsed ? <span className="sr-only">Ajustes</span> : 'Ajustes'}
      </Link>
      <button
        type="button"
        data-menu-sign-out
        onClick={() => {
          onNavigate()
          signOut()
          router.push('/entrar')
        }}
        title={collapsed ? 'Cerrar sesión' : undefined}
        className={cn('flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-primary hover:bg-accent', collapsed && 'justify-center px-0')}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {collapsed ? <span className="sr-only">Cerrar sesión</span> : 'Cerrar sesión'}
      </button>
    </div>
  )
}
