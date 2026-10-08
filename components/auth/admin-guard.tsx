'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!user) router.replace('/entrar')
    else if (user.role !== 'admin') router.replace('/')
  }, [ready, user, router])

  if (!ready || user?.role !== 'admin') {
    return <p className="px-6 py-10 text-sm text-muted-foreground">Cargando…</p>
  }

  return children
}
