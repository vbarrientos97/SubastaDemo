export type DemoNotificationType = 'outbid' | 'closing' | 'won' | 'sold' | 'auction-starting'
export type DemoNotification = {
  id: string
  type: DemoNotificationType
  lotId: string
  lotOrder: number
  createdAt: string
  read: boolean
}

export const NOTIFICATIONS_PREFIX = 'subasta.notificaciones-demo.v2.'
const LEGACY_KEY = 'subasta.notificaciones-demo.v1'
const LEGACY_OWNER_KEY = `${LEGACY_KEY}.owner`
const types = new Set(['outbid', 'closing', 'won', 'sold', 'auction-starting'])

export function isDemoNotification(value: unknown): value is DemoNotification {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.id === 'string' && typeof row.lotId === 'string' &&
    typeof row.type === 'string' && types.has(row.type) &&
    typeof row.lotOrder === 'number' && Number.isSafeInteger(row.lotOrder) && row.lotOrder > 0 &&
    typeof row.read === 'boolean' && typeof row.createdAt === 'string' && Number.isFinite(Date.parse(row.createdAt))
}

function parse(value: string | null): DemoNotification[] | null {
  if (value === null) return null
  try {
    const rows: unknown = JSON.parse(value)
    if (!Array.isArray(rows)) return null
    const seen = new Set<string>()
    return rows.filter(isDemoNotification).filter((row) => {
      if (seen.has(row.id)) return false
      seen.add(row.id)
      return true
    })
  } catch { return null }
}

// These are sample scenarios, not events inferred from real bidding activity.
function seed(): DemoNotification[] {
  const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()
  return [
    { id: 'demo-outbid-02', type: 'outbid', lotId: 'lote-02', lotOrder: 2, createdAt: ago(2), read: false },
    { id: 'demo-closing-04', type: 'closing', lotId: 'lote-04', lotOrder: 4, createdAt: ago(8), read: false },
    { id: 'demo-won-03', type: 'won', lotId: 'lote-03', lotOrder: 3, createdAt: ago(28), read: false },
    { id: 'demo-sold-05', type: 'sold', lotId: 'lote-05', lotOrder: 5, createdAt: ago(180), read: true },
    { id: 'demo-starting-06', type: 'auction-starting', lotId: 'lote-06', lotOrder: 6, createdAt: ago(420), read: true },
  ]
}

export function createNotificationStore(storage: () => Pick<Storage, 'getItem' | 'setItem'>) {
  const memory = new Map<string, DemoNotification[]>()
  const memoryOnly = new Set<string>()
  let legacyOwner: string | null = null
  const key = (accountId: string) => NOTIFICATIONS_PREFIX + encodeURIComponent(accountId)
  function save(accountId: string, rows: DemoNotification[]) {
    memory.set(accountId, rows)
    if (memoryOnly.has(accountId)) return
    try { storage().setItem(key(accountId), JSON.stringify(rows)) }
    catch { memoryOnly.add(accountId) }
  }
  function load(accountId: string): DemoNotification[] {
    if (memoryOnly.has(accountId)) return memory.get(accountId) ?? []
    try {
      const rows = parse(storage().getItem(key(accountId)))
      if (rows !== null) { memory.set(accountId, rows); return rows }
      const owner = legacyOwner ?? storage().getItem(LEGACY_OWNER_KEY)
      const legacy = !owner || owner === accountId ? parse(storage().getItem(LEGACY_KEY)) : null
      const initial = legacy ?? seed()
      memory.set(accountId, initial)
      if (legacy) {
        legacyOwner = accountId
        storage().setItem(LEGACY_OWNER_KEY, accountId)
      }
      save(accountId, initial)
      return initial
    } catch {
      memoryOnly.add(accountId)
      const rows = memory.get(accountId) ?? seed()
      memory.set(accountId, rows)
      return rows
    }
  }
  return { load, save }
}
