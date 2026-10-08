'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

function isDark() {
  return document.documentElement.classList.contains('dark')
}

function setTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const storedDark = useSyncExternalStore(subscribe, isDark, () => true)
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  const dark = ready ? storedDark : true

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-full border p-0.5 shadow-sm backdrop-blur-md',
          'border-[#0c3d28]/15 bg-[#f7f1e4]/85',
          'dark:border-white/15 dark:bg-black/45',
          className,
        )}
        role="group"
        aria-label="Apariencia"
      >
        <button
          type="button"
          aria-label="Claro"
          aria-pressed={!dark}
          onClick={() => setTheme(false)}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full transition',
            !dark ? 'bg-[#0c3d28] text-white' : 'text-[#0c3d28]/55 hover:text-[#0c3d28] dark:text-white/55 dark:hover:text-white',
          )}
        >
          <Sun className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Oscuro"
          aria-pressed={dark}
          onClick={() => setTheme(true)}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full transition',
            dark ? 'bg-white/15 text-white' : 'text-[#0c3d28]/55 hover:text-[#0c3d28]',
          )}
        >
          <Moon className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn('px-1.5 py-1.5', className)} role="group" aria-label="Apariencia">
      <div className="flex rounded-xl bg-background/60 p-1">
        <button
          type="button"
          aria-pressed={!dark}
          onClick={() => setTheme(false)}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold transition',
            !dark
              ? 'bg-black text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Sun className="h-4 w-4" />
          Claro
        </button>
        <button
          type="button"
          aria-pressed={dark}
          onClick={() => setTheme(true)}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold transition',
            dark
              ? 'bg-surface text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Moon className="h-4 w-4" />
          Oscuro
        </button>
      </div>
    </div>
  )
}
