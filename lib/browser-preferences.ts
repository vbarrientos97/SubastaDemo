const memory = new Map<string, string>()
const unavailable = new Set<string>()
const CHANGE_EVENT = 'subasta:preferences-changed'

export function subscribePreferences(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

/** Small preferences survive storage failures for the lifetime of this page. */
export function readPreference(key: string, session = false): string | null {
  const id = `${session ? 'session' : 'local'}:${key}`
  if (unavailable.has(id)) return memory.get(id) ?? null
  try {
    const value = (session ? window.sessionStorage : window.localStorage).getItem(key)
    if (value !== null) memory.set(id, value)
    else memory.delete(id)
    return value
  } catch { return memory.get(id) ?? null }
}

export function writePreference(key: string, value: string, session = false) {
  const id = `${session ? 'session' : 'local'}:${key}`
  memory.set(id, value)
  try { (session ? window.sessionStorage : window.localStorage).setItem(key, value) }
  catch { unavailable.add(id) }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}
