'use client'

import { useCallback, useEffect, useState } from 'react'
import { buyer } from '@/lib/data/buyer'

function photoKey(clientId: string) {
  return `subasta.buyer-photo.${clientId}`
}

const PHOTO_UPDATED_EVENT = 'subasta:buyer-photo-updated'

export function useBuyerPhoto(clientId?: string) {
  const [photo, setPhoto] = useState(buyer.photo)

  useEffect(() => {
    if (!clientId) return
    try {
      setPhoto(window.localStorage.getItem(photoKey(clientId)) || buyer.photo)
    } catch {
      setPhoto(buyer.photo)
    }
    function updatePhoto(event: Event) {
      const detail = (event as CustomEvent<{ clientId: string; photo: string }>).detail
      if (detail?.clientId === clientId) setPhoto(detail.photo)
    }
    window.addEventListener(PHOTO_UPDATED_EVENT, updatePhoto)
    return () => window.removeEventListener(PHOTO_UPDATED_EVENT, updatePhoto)
  }, [clientId])

  const savePhoto = useCallback((dataUrl: string) => {
    if (!clientId) return false
    try {
      // Demo only: production MUST validate and store profile photos on the server.
      window.localStorage.setItem(photoKey(clientId), dataUrl)
      setPhoto(dataUrl)
      window.dispatchEvent(new CustomEvent(PHOTO_UPDATED_EVENT, { detail: { clientId, photo: dataUrl } }))
      return true
    } catch {
      return false
    }
  }, [clientId])

  return { photo, savePhoto }
}
