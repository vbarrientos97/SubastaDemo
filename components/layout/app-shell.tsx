'use client'

import { usePathname } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { AdminShell } from '@/components/admin/admin-shell'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DesktopNav } from '@/components/layout/desktop-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { ready, user } = useSession()
  const isAdminRoute = pathname.startsWith('/admin')
  const isAccountRoute = ['/cuenta', '/perfil', '/ajustes'].includes(pathname)
  const isAdminAccountRoute = isAccountRoute && user?.role === 'admin'
  const deferAccountChrome = isAccountRoute && (!ready || !user)
  const anonymousVisitor = ready && !user
  const bare = isAdminRoute ||
    isAdminAccountRoute ||
    deferAccountChrome ||
    pathname === '/entrar' ||
    pathname === '/registro'

  return (
    <div
      className={cn(
        'relative mx-auto min-h-svh max-w-md border-x border-border bg-background shadow-2xl shadow-black/40 lg:max-w-none lg:border-x-0 lg:shadow-none',
        bare ? 'pb-10' : 'pb-24 lg:pb-10',
      )}
    >
      {isAdminRoute ? children : isAdminAccountRoute ? (
        <AdminShell showMobileMenu>{children}</AdminShell>
      ) : (
        <>
          {bare ? null : <DesktopNav />}
          {bare || anonymousVisitor ? null : <DesktopSidebar />}
          {children}
          {bare || anonymousVisitor ? null : <BottomNav />}
        </>
      )}
    </div>
  )
}
