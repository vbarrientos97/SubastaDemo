'use client'

import Link from 'next/link'
import { ProfileMenu } from '@/components/account/profile-menu'
import { BrandMark } from '@/components/layout/brand-mark'

export function AdminBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 lg:gap-4 lg:px-6">
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5 lg:hidden" aria-label="Administración de Rodeo">
          <BrandMark className="h-9 w-9 rounded-lg" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foreground">Administración</span>
            <span className="block truncate text-[10px] leading-3 text-muted-foreground">Subastas ganaderas</span>
          </span>
        </Link>
        <div className="ml-auto">
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}
