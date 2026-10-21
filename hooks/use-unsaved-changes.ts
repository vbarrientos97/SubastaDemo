'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { NavigationRequest } from '@/lib/before-navigation'

export function useUnsavedChanges(dirty: boolean, onBlocked: () => void) {
  const router = useRouter()
  const pending = useRef<(() => void) | null>(null)
  const allowed = useRef(false)
  useEffect(() => {
    if (!dirty) { allowed.current = false; pending.current = null; return }
    function block(resume: () => void) { allowed.current = false; pending.current = resume; onBlocked() }
    function onRequest(event: Event) {
      if (allowed.current) return
      const request = event as CustomEvent<NavigationRequest>
      event.preventDefault()
      block(request.detail.resume ?? (() => router.push(request.detail.href)))
    }
    function onClick(event: MouseEvent) {
      if (allowed.current) return
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
      const url = new URL(anchor.href)
      if (url.href === window.location.href) return
      event.preventDefault()
      event.stopPropagation()
      block(() => {
        if (url.origin === window.location.origin) router.push(url.pathname + url.search + url.hash)
        else window.location.assign(url.href)
      })
    }
    function onUnload(event: BeforeUnloadEvent) { if (!allowed.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('app:before-navigation', onRequest)
    document.addEventListener('click', onClick, true)
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('app:before-navigation', onRequest)
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [dirty, onBlocked, router])
  return {
    cancelNavigation() { allowed.current = false; pending.current = null },
    discardAndContinue(fallback: () => void) {
      const resume = pending.current
      pending.current = null
      allowed.current = true
      // Let React remove the dirty form and its beforeunload listener first.
      window.setTimeout(resume ?? fallback, 0)
    },
  }
}
