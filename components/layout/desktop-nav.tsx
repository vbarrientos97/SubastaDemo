'use client'

import Link from 'next/link'
import { BrandMark } from '@/components/layout/brand-mark'
import { usePathname } from 'next/navigation'

export function DesktopNav() {
  const pathname = usePathname()
  const loginHref = /^\/(?:subasta\/[^/]+|lote\/[^/]+)$/.test(pathname)
    ? `/entrar?next=${encodeURIComponent(pathname)}`
    : '/entrar'
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-background/85 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-6">
        <Link href="/" aria-label="Subasta Ganadera" className="flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <span className="font-display text-sm font-bold text-foreground">Subasta Ganadera</span>
        </Link>
        <Link href={loginHref} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Ingresar</Link>
      </div>
    </header>
  )
}
