import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { ProfileMenu } from '@/components/account/profile-menu'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function TopBar({
  title,
  subtitle,
  backHref,
  right,
  transparent,
}: {
  title: string
  subtitle?: string
  backHref?: string
  right?: React.ReactNode
  transparent?: boolean
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3 px-4 py-3 lg:hidden',
        transparent
          ? 'bg-transparent'
          : 'border-b border-border bg-background/85 backdrop-blur-xl',
      )}
    >
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-foreground transition hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      ) : (
        <BrandMark className="h-10 w-10 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        {subtitle && (
          <p className={cn(eyebrow, 'truncate text-primary')}>
            {subtitle}
          </p>
        )}
        <h1 className="truncate font-display text-lg font-bold leading-tight text-foreground">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {right}
        <ProfileMenu />
      </div>
    </header>
  )
}
