'use client'

import { MainNav } from '@/components/layout/main-nav'

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md lg:hidden">
      <div className="border-t border-border bg-background/85 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <MainNav variant="dock" />
      </div>
    </nav>
  )
}
