'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { buyer } from '@/lib/data/buyer'

const photoKey = (clientId: string) => `subasta.buyer-photo.${clientId}`
const PHOTO_UPDATED_EVENT = 'subasta:buyer-photo-updated'
function subscribe(listener: () => void) {
  window.addEventListener(PHOTO_UPDATED_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(PHOTO_UPDATED_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function useBuyerPhoto(clientId?: string) {
  const getSnapshot = useCallback(() => {
    if (!clientId) return buyer.photo
    try { return window.localStorage.getItem(photoKey(clientId)) || buyer.photo }
    catch { return buyer.photo }
  }, [clientId])
  const photo = useSyncExternalStore(subscribe, getSnapshot, () => buyer.photo)
  const savePhoto = useCallback((dataUrl: string) => {
    if (!clientId) return false
    try {
      window.localStorage.setItem(photoKey(clientId), dataUrl)
      window.dispatchEvent(new Event(PHOTO_UPDATED_EVENT))
      return true
    } catch { return false }
  }, [clientId])
  return { photo, savePhoto }
}
