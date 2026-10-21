/** Only same-origin paths are accepted, including when browsers normalize slashes. */
export function safeInternalPath(value: string | null | undefined, fallback = '/') {
  if (!value?.startsWith('/') || /[\\\u0000-\u0020]/.test(value)) return fallback
  try {
    const base = 'https://subasta.invalid'
    const url = new URL(value, base)
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : fallback
  } catch { return fallback }
}
