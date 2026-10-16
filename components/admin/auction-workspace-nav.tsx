'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auctionWorkspaceNav, isNavItemActive } from '@/lib/navigation'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function AuctionWorkspaceNav({ auctionId }: { auctionId: string }) {
  const pathname = usePathname()
  const items = auctionWorkspaceNav(auctionId)

  return (
    <aside className={cn(panel, 'shrink-0 overflow-hidden lg:w-56')}>
      <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
        {items.map((item) => {
          const active = isNavItemActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold',
                active ? 'bg-destructive-soft text-destructive dark:bg-primary/10 dark:text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
