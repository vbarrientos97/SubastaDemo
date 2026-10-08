export function youtubeId(url?: string) {
  const value = url?.trim()
  if (!value) return null
  try {
    const parsed = new URL(value)
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0] || null
    if (parsed.hostname.endsWith('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/')[2] || null
      return parsed.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}
