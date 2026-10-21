'use client'

import { usePathname } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { AdminShell } from '@/components/admin/admin-shell'
import { DesktopNav } from '@/components/layout/desktop-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { cn } from '@/lib/utils'
import { LogicalBackGuard } from '@/components/layout/logical-back-guard'
import { BuyerNotificationToasts } from '@/components/notifications/buyer-notification-toasts'
import { MainMenuDrawer } from '@/components/layout/main-menu-drawer'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { ready, user } = useSession()
  const isAdminRoute = pathname.startsWith('/admin')
  const isAccountRoute = pathname === '/ajustes'
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
        'pb-10',
      )}
    >
      <LogicalBackGuard />
      {user?.role === 'buyer' && !bare ? <MainMenuDrawer floating /> : null}
      {ready && user?.role === 'buyer' ? <BuyerNotificationToasts key={user.id} /> : null}
      {isAdminRoute ? children : isAdminAccountRoute ? (
        <AdminShell>{children}</AdminShell>
      ) : (
        <>
          {bare || user || (anonymousVisitor && pathname === '/') ? null : <DesktopNav />}
          {bare || anonymousVisitor ? null : <DesktopSidebar />}
          <div className={cn(!bare && !anonymousVisitor && 'lg:pl-[4.5rem]')}>{children}</div>
        </>
      )}
    </div>
  )
}
