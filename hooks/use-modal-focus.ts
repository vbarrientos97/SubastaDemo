'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

let scrollLocks = 0
let originalOverflow = ''
const activeDialogs: HTMLElement[] = []
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Shared keyboard and focus behavior for overlays, including responsive form panels. */
export function useModalFocus(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void, mediaQuery?: string) {
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  const [matches, setMatches] = useState(!mediaQuery)

  useEffect(() => {
    if (!mediaQuery) return
    const media = window.matchMedia(mediaQuery)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [mediaQuery])

  const active = open && matches
  useEffect(() => {
    const dialog = ref.current
    if (!active || !dialog) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (scrollLocks++ === 0) {
      originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    activeDialogs.push(dialog)
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter((node) => node.getClientRects().length > 0 && !node.closest('[hidden], [inert]'))
    const focusFirst = () => (controls()[0] ?? dialog).focus()
    focusFirst()
    const isTop = () => activeDialogs[activeDialogs.length - 1] === dialog
    function onKey(event: KeyboardEvent) {
      if (!isTop()) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeRef.current()
      } else if (event.key === 'Tab') {
        const items = controls()
        const first = items[0]
        const last = items[items.length - 1]
        if (!first) { event.preventDefault(); dialog?.focus(); return }
        if (!dialog?.contains(document.activeElement) || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
          event.preventDefault()
          ;(event.shiftKey ? last : first).focus()
        }
      }
    }
    function onFocus(event: FocusEvent) {
      if (isTop() && event.target instanceof Node && !dialog?.contains(event.target)) focusFirst()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
      activeDialogs.splice(activeDialogs.indexOf(dialog), 1)
      if (--scrollLocks === 0) document.body.style.overflow = originalOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [active, ref])
  return active
}
