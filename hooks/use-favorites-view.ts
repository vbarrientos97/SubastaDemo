'use client'

import { useEffect, useState } from 'react'
import {
  parseFavoritesView,
  readFavoritesViewCookie,
  writeFavoritesViewCookie,
  type FavoritesView,
} from '@/lib/favorites-view'

export function useFavoritesView() {
  const [view, setViewState] = useState<FavoritesView>('grid')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setViewState(readFavoritesViewCookie())
    setReady(true)
  }, [])

  function setView(next: FavoritesView) {
    setViewState(next)
    writeFavoritesViewCookie(next)
    document.documentElement.dataset.favoritosVista = next
  }

  return { view: ready ? view : parseFavoritesView(undefined), setView, ready }
}
