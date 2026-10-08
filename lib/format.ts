export function formatUSD(value: number, opts?: { decimals?: boolean }) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: opts?.decimals ? 2 : 0,
    maximumFractionDigits: opts?.decimals ? 2 : 0,
  }).format(value)
}

export function formatKg(value: number) {
  return new Intl.NumberFormat('es-PA').format(value)
}

/** Format seconds into MM:SS, or HH:MM:SS when there is at least one hour. */
export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return `${pad(minutes)}:${pad(seconds)}`
}
