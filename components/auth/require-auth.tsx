'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'

export function RequireAuth({
  children,
  next,
}: {
  children: React.ReactNode
  next: string
}) {
  const { ready, user } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) router.replace(`/entrar?next=${encodeURIComponent(next)}`)
  }, [ready, user, router, next])

  if (!ready || !user) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Cargando…</p>
  }

  return children
}
