'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Back control with an explicit logical parent so direct links have a safe destination. */
export function BackLink({
  href,
  children = 'Volver',
  className,
  historyBack = false,
}: {
  href: string
  children?: React.ReactNode
  className?: string
  historyBack?: boolean
}) {
  const router = useRouter()
  return (
    <Link
      href={href}
      replace
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        const request = new CustomEvent('app:before-navigation', { cancelable: true, detail: { href } })
        window.dispatchEvent(request)
        if (request.defaultPrevented) {
          event.preventDefault()
          return
        }
        if (historyBack) {
          event.preventDefault()
          router.back()
        }
      }}
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      <ArrowLeft aria-hidden className="h-5 w-5 shrink-0" />
      <span>{children}</span>
    </Link>
  )
}
