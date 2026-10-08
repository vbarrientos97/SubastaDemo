'use client'

import { ProfileMenu } from '@/components/account/profile-menu'
import { useSession } from '@/components/auth/session-provider'
import { NotificationsMenu } from '@/components/layout/notifications-menu'
import Link from 'next/link'
import { BrandMark } from '@/components/layout/brand-mark'

export function DesktopNav() {
  const { user } = useSession()

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-background/85 backdrop-blur-xl lg:block">
      <div className={`mx-auto flex h-16 max-w-7xl items-center gap-8 px-6 ${user ? 'justify-end lg:pl-20' : 'justify-between'}`}>
        {!user ? (
          <Link href="/" aria-label="Subasta Ganadera" className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <span className="font-display text-sm font-bold text-foreground">Subasta Ganadera</span>
          </Link>
        ) : null}
        {user?.role === 'buyer' ? (
          <NotificationsMenu />
        ) : null}
        <ProfileMenu />
      </div>
    </header>
  )
}
