'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, ZoomIn, X } from 'lucide-react'
import { youtubeId } from '@/lib/youtube'
import { cn } from '@/lib/utils'
import { SoldStamp } from '@/components/auction/sold-stamp'

type View = 'photo' | 'video'

export function LiveGallery({
  image,
  images,
  title,
  soldPaddle,
  youtubeUrl,
}: {
  image: string
  images?: string[]
  title: string
  soldPaddle?: number
  youtubeUrl?: string
}) {
  const photos = (images?.filter(Boolean).length ? images!.filter(Boolean) : [image || '/placeholder.svg']).slice(0, 4)
  const video = youtubeId(youtubeUrl)
  const videoCover = photos[0] ?? image
  const [view, setView] = useState<View>('photo')
  const [photoIndex, setPhotoIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const currentPhoto = photos[photoIndex] ?? photos[0]

  useEffect(() => {
    if (!zoom) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setZoom(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [zoom])

  const thumbs: { key: string; label: string; active: boolean; onClick: () => void; node: React.ReactNode }[] = [
    ...photos.map((photo, index) => ({
      key: `photo-${index}`,
      label: index === 3 ? 'Certificado genealógico' : `Foto ${index + 1}`,
      active: view === 'photo' && photoIndex === index,
      onClick: () => {
        setView('photo')
        setPhotoIndex(index)
      },
      node: <Image src={photo} alt="" fill className="object-cover" sizes="72px" />,
    })),
    {
      key: 'video',
      label: 'Video',
      active: view === 'video',
      onClick: () => setView('video'),
      node: (
        <>
          <Image src={videoCover} alt="" fill className="object-cover opacity-70" sizes="72px" />
          <span className="absolute inset-0 flex items-center justify-center">
            <Play className="h-5 w-5 fill-white text-white" />
          </span>
        </>
      ),
    },
  ]

  return (
    <>
    <div className="relative aspect-[3/2] w-full overflow-hidden bg-black">
      {/* Main view */}
      {view === 'photo' && (
        <Image
          src={currentPhoto}
          alt={title}
          fill
          priority
          sizes="448px"
          className="object-cover"
        />
      )}
      {view === 'video' && video && (
        <iframe
          src={`https://www.youtube.com/embed/${video}`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {view === 'video' && !video && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Image src={videoCover} alt={title} fill className="object-cover opacity-70" sizes="448px" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/50">
            <Play className="h-8 w-8 fill-white" />
          </span>
        </div>
      )}

      {soldPaddle != null && (view === 'photo' || view === 'video') && (
        <SoldStamp paddle={soldPaddle} size="lg" />
      )}

      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label="Ver imagen en grande"
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-black/75"
      >
        <ZoomIn className="h-3.5 w-3.5" />
        HD
      </button>

      {/* Thumbnails */}
      <div className="absolute inset-x-3 bottom-3 flex gap-2">
        {thumbs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={t.onClick}
            aria-label={t.label}
            aria-pressed={t.active}
            className={cn(
              'relative h-16 w-16 overflow-hidden rounded-xl ring-2 transition',
              t.active ? 'ring-primary' : 'ring-white/20 hover:ring-white/50',
            )}
          >
            {t.node}
          </button>
        ))}
      </div>
    </div>

    {zoom && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={() => setZoom(false)}
      >
        <button
          type="button"
          onClick={() => setZoom(false)}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        >
          <X className="h-5 w-5" />
        </button>
        <div
          className="relative h-[min(86vh,920px)] w-full max-w-5xl"
          onClick={(event) => event.stopPropagation()}
        >
          <Image
            src={currentPhoto}
            alt={title}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>
    )}
    </>
  )
}
