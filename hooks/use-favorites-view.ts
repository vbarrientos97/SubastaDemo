'use client'

import { useSyncExternalStore } from 'react'
import { readFavoritesViewCookie, writeFavoritesViewCookie, type FavoritesView } from '@/lib/favorites-view'

const CHANGE_EVENT = 'subasta:favorites-view-changed'
function subscribe(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener)
  return () => window.removeEventListener(CHANGE_EVENT, listener)
}
const subscribeHydration = () => () => {}

export function useFavoritesView() {
  const view = useSyncExternalStore(subscribe, readFavoritesViewCookie, () => 'columns' as const)
  const ready = useSyncExternalStore(subscribeHydration, () => true, () => false)
  function setView(next: FavoritesView) {
    writeFavoritesViewCookie(next)
    document.documentElement.dataset.favoritosVista = next
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }
  return { view, setView, ready }
}
