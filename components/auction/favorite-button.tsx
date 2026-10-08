'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { AuthPrompt } from '@/components/auth/auth-prompt'
import { useSession } from '@/components/auth/session-provider'
import { cn } from '@/lib/utils'

export function FavoriteButton({
  lotId,
  className,
  label,
}: {
  lotId: string
  className?: string
  label?: boolean
}) {
  const { ready, user, favoriteLotIds, toggleFavorite, savePendingFavorite } = useSession()
  const pathname = usePathname()
  const [promptOpen, setPromptOpen] = useState(false)
  const fav = favoriteLotIds.includes(lotId)

  function onClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (!ready) return
    if (!user) {
      savePendingFavorite(lotId)
      setPromptOpen(true)
      return
    }
    toggleFavorite(lotId)
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={fav}
        aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className={cn(
          'inline-flex items-center gap-2 rounded-full transition active:scale-95',
          label
            ? 'px-3.5 py-2 text-sm font-semibold ring-1'
            : 'h-9 w-9 justify-center bg-black/45 ring-1 backdrop-blur-sm',
          fav
            ? 'bg-primary/15 text-primary ring-primary/40'
            : label
              ? 'bg-surface-2 text-foreground ring-border'
              : 'text-white ring-white/15 hover:ring-white/30',
          className,
        )}
      >
        <Heart className={cn('h-4 w-4', fav && 'fill-primary')} />
        {label && <span>{fav ? 'En favoritos' : 'Favorito'}</span>}
      </button>
      <AuthPrompt open={promptOpen} onClose={() => setPromptOpen(false)} nextPath={pathname} />
    </>
  )
}
