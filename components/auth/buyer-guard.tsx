'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'

export function BuyerGuard({ children, next }: { children: React.ReactNode; next: string }) {
  const { ready, user } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!user) router.replace(`/entrar?next=${encodeURIComponent(next)}`)
    else if (user.role !== 'buyer') router.replace('/admin')
  }, [ready, user, router, next])

  if (!ready || user?.role !== 'buyer') {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Cargando…</p>
  }

  return children
}
