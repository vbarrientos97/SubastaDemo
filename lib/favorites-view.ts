export type FavoritesView = 'grid' | 'columns'

export const FAVORITES_VIEW_COOKIE = 'favoritos.vista'

export function parseFavoritesView(value: string | null | undefined): FavoritesView {
  return value === 'columns' ? 'columns' : 'grid'
}

export function readFavoritesViewCookie(): FavoritesView {
  if (typeof document === 'undefined') return 'grid'
  const match = document.cookie.match(/(?:^|; )favoritos\.vista=([^;]*)/)
  return parseFavoritesView(match?.[1] ? decodeURIComponent(match[1]) : null)
}

export function writeFavoritesViewCookie(view: FavoritesView) {
  document.cookie = `${FAVORITES_VIEW_COOKIE}=${view}; path=/; max-age=31536000; SameSite=Lax`
}
