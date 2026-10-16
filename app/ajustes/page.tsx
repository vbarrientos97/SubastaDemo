'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Bell, Camera } from 'lucide-react'
import { AdminSettings } from '@/components/admin/admin-settings'
import { RequireAuth } from '@/components/auth/require-auth'
import { ThemeToggle } from '@/components/account/theme-toggle'
import { useBuyerPhoto } from '@/components/account/use-buyer-photo'
import { useSession } from '@/components/auth/session-provider'
import { TopBar } from '@/components/layout/top-bar'
import { BackLink } from '@/components/layout/back-link'
import { panel } from '@/lib/styles'
import { cn } from '@/lib/utils'

function BuyerSettings() {
  const { user, client } = useSession()
  const homeHref = '/'
  const { photo, savePhoto } = useBuyerPhoto(client?.id)
  const [preview, setPreview] = useState<string | null>(null)
  const [photoMessage, setPhotoMessage] = useState('')
  const [bidNotice, setBidNotice] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const name = client?.name ?? user?.username ?? 'Usuario'

  useEffect(() => {
    setBidNotice(window.localStorage.getItem('subasta.aviso-puja') !== 'false')
  }, [])

  function toggleBidNotice(enabled: boolean) {
    setBidNotice(enabled)
    window.localStorage.setItem('subasta.aviso-puja', String(enabled))
    window.dispatchEvent(new CustomEvent('subasta:bid-notice-setting-changed', { detail: enabled }))
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoMessage('Selecciona una imagen.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoMessage('La imagen debe pesar menos de 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreview(reader.result)
        setPhotoMessage('')
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function save() {
    if (!preview) return
    const saved = savePhoto(preview)
    setPhotoMessage(saved ? 'Foto guardada en este dispositivo.' : 'No se pudo guardar. Prueba con una imagen más pequeña.')
    if (saved) setPreview(null)
  }

  return (
    <>
      <TopBar title="Ajustes" backHref={homeHref} />
      <main className="flex flex-col gap-5 px-4 py-4 lg:mx-auto lg:max-w-3xl lg:px-6 lg:py-8">
        <div className="hidden lg:block"><BackLink href={homeHref} /></div>

        <section aria-labelledby="account-heading" className={cn(panel, 'flex flex-col items-center gap-4 p-5 text-center')}>
          <h1 id="account-heading" className="font-display text-xl font-bold text-foreground">Mi cuenta</h1>
          <img
            src={preview ?? photo}
            alt={`Foto de ${name}`}
            className="h-32 w-32 rounded-full object-cover ring-1 ring-foreground/10"
          />
          <input ref={inputRef} type="file" accept="image/*" onChange={selectPhoto} className="sr-only" aria-label="Seleccionar foto de perfil" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-5 text-base font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Camera className="h-5 w-5" />
            Cambiar foto
          </button>
          {preview ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button type="button" onClick={() => setPreview(null)} className="min-h-12 rounded-xl border border-border px-5 text-base font-semibold text-foreground hover:bg-accent">Cancelar</button>
              <button type="button" onClick={save} className="min-h-12 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground hover:bg-primary-hover dark:hover:bg-primary/90">Guardar foto</button>
            </div>
          ) : null}
          {photoMessage ? <p role="status" className="text-sm text-muted-foreground">{photoMessage}</p> : null}
          <div>
            <p className="font-display text-lg font-bold text-foreground">{name}</p>
            {client ? <p className="mt-1 text-sm text-muted-foreground">Número de cliente: #{client.paddle}</p> : null}
          </div>
        </section>

        <section aria-labelledby="preferences-heading" className="flex flex-col gap-3">
          <h2 id="preferences-heading" className="px-1 font-display text-lg font-bold text-foreground">Preferencias</h2>
          <section className={cn(panel, 'flex min-h-16 items-center gap-3 p-4')}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
              <Bell className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-foreground">Aviso de puja</span>
              <span className="block text-sm text-muted-foreground">Cuando te superen en una puja</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={bidNotice}
              aria-label="Aviso de puja"
              onClick={() => toggleBidNotice(!bidNotice)}
              className={cn('relative h-11 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', bidNotice ? 'bg-primary' : 'bg-muted')}
            >
              <span className={cn('absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-card transition-all dark:bg-white', bidNotice ? 'left-7' : 'left-1')} />
            </button>
          </section>
          <section className={cn(panel, 'p-4')}>
            <h3 className="mb-2 text-base font-semibold text-foreground">Modo oscuro/claro</h3>
            <ThemeToggle className="-mx-1.5" />
          </section>
        </section>
      </main>
    </>
  )
}

function SettingsContent() {
  const { user } = useSession()
  return user?.role === 'admin' ? <AdminSettings /> : <BuyerSettings />
}

export default function AjustesPage() {
  return (
    <RequireAuth next="/ajustes">
      <SettingsContent />
    </RequireAuth>
  )
}
