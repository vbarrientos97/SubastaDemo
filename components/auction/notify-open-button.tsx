'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BellRing } from 'lucide-react'
import { useSession } from '@/components/auth/session-provider'
import { btnPrimary, btnPrimaryMotion } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function NotifyOpenButton() {
  const pathname = usePathname()
  const { ready, user } = useSession()

  if (!ready) return null
  if (!user) {
    return (
      <Link
        href={`/entrar?next=${encodeURIComponent(pathname)}`}
        className={cn(btnPrimary, btnPrimaryMotion)}
      >
        <BellRing className="h-4 w-4" />
        Avisarme cuando abra
      </Link>
    )
  }

  return (
    <button type="button" className={cn(btnPrimary, btnPrimaryMotion)}>
      <BellRing className="h-4 w-4" />
      Avisarme cuando abra
    </button>
  )
}
