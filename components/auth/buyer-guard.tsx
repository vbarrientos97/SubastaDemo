'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'

export function BuyerGuard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!user) router.replace(`/entrar?next=${encodeURIComponent('/pujas')}`)
    else if (user.role !== 'buyer') router.replace('/admin')
  }, [ready, user, router])

  if (!ready || user?.role !== 'buyer') {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Cargando…</p>
  }

  return children
}
