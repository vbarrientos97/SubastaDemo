'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminGuard } from '@/components/auth/admin-guard'
import { AdminBreadcrumbs } from '@/components/admin/admin-breadcrumbs'

export function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-5 pt-3 lg:gap-6 lg:px-6 lg:py-8 lg:pl-24">
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
