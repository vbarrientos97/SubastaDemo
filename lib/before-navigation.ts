export type NavigationRequest = { href: string; resume?: () => void }

export function requestNavigation(href: string, resume: () => void) {
  const event = new CustomEvent<NavigationRequest>('app:before-navigation', {
    cancelable: true, detail: { href, resume },
  })
  window.dispatchEvent(event)
  if (!event.defaultPrevented) resume()
}
