'use client'

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'

export function useMainMenuDrawer(pathname: string) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const [previousPath, setPreviousPath] = useState(pathname)
  if (previousPath !== pathname) { setPreviousPath(pathname); setOpen(false) }

  const closeMenu = useCallback((afterClose?: () => void) => {
    if (window.history.state?.mainMenuDrawer) {
      if (afterClose) window.addEventListener('popstate', () => afterClose(), { once: true })
      window.history.back()
    } else {
      afterClose?.()
    }
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef.current
    document.body.style.overflow = 'hidden'
    window.history.pushState({ ...window.history.state, mainMenuDrawer: true }, '', window.location.href)
    closeRef.current?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!menuRef.current?.contains(document.activeElement)) {
        event.preventDefault()
          ; (event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    function onPopState() { setOpen(false) }
    document.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPopState)
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [closeMenu, open])

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStartRef.current
    const end = event.changedTouches[0]
    touchStartRef.current = null
    if (start && end.clientX - start.x > 60 && Math.abs(start.y - end.clientY) < 80) closeMenu()
  }


  return {
    open, triggerRef, closeRef, menuRef, closeMenu,
    openMenu: () => setOpen(true),
    hideMenu: () => setOpen(false),
    handleTouchStart(event: TouchEvent<HTMLElement>) {
      touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    },
    handleTouchEnd,
  }
}
