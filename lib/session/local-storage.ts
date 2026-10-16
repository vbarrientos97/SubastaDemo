import type { SessionRepository, SessionState } from '@/lib/application/session-repository'
import { migrateSessionState, SESSION_SCHEMA_VERSION } from '@/lib/application/session-repository'
import { createSeed } from '@/lib/session/seed'
import { upgradeLegacyDemo } from '@/lib/session/legacy-migrations'
import { isStoredSession } from '@/lib/session/validate-storage'

export const SESSION_STORAGE_KEY = 'subasta.session'

/** Keep the current demo usable in memory when browser storage is unavailable. */
export function createLocalStorageSession(): SessionRepository {
  let memory: SessionState | null = null
  let memoryOnly = false

  function save(state: SessionState) {
    memory = { ...state, schemaVersion: SESSION_SCHEMA_VERSION }
    if (memoryOnly) return
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(memory))
    } catch {
      memoryOnly = true
    }
  }

  return {
    load() {
      if (typeof window === 'undefined') return null
      if (memoryOnly) return memory
      try {
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
        if (raw) {
          const parsed: unknown = JSON.parse(raw)
          if (isStoredSession(parsed)) {
            memory = upgradeLegacyDemo(parsed, migrateSessionState(parsed))
            if ((parsed.schemaVersion ?? 0) < SESSION_SCHEMA_VERSION) save(memory)
            return memory
          }
        }
      } catch {
        // Invalid stores are replaced with a seed; failed writes fall back to memory.
      }
      save(createSeed())
      return memory
    },
    save,
  }
}
