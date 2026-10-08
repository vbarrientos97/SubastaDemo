'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { btnPrimary, btnPrimaryMotion, panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function AuthPrompt({
  open,
  onClose,
  nextPath,
}: {
  open: boolean
  onClose: () => void
  nextPath: string
}) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const next = encodeURIComponent(nextPath)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
      onClick={onClose}
    >
      <div
        className={cn(panel, 'relative w-full max-w-sm p-5 shadow-xl shadow-black/30')}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 id="auth-prompt-title" className="font-display text-xl font-bold text-foreground">
          Guarda este lote
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inicia sesión o regístrate para agregar lotes a tus favoritos.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <Link href={`/entrar?next=${next}`} className={cn(btnPrimary, btnPrimaryMotion)}>
            Iniciar sesión
          </Link>
          <Link
            href={`/registro?next=${next}`}
            className="flex items-center justify-center rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            Registrarme
          </Link>
        </div>
      </div>
    </div>
  )
}
