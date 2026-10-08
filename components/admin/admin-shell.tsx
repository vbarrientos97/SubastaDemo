'use client'

import { AdminBar } from '@/components/admin/admin-bar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminGuard } from '@/components/auth/admin-guard'

export function AdminShell({
  children,
  showMobileMenu = false,
}: {
  children: React.ReactNode
  showMobileMenu?: boolean
}) {
  return (
    <AdminGuard>
      <AdminBar />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 lg:gap-6 lg:px-6 lg:py-8 lg:pl-24">
        <AdminSidebar showMobileMenu={showMobileMenu} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </AdminGuard>
  )
}
