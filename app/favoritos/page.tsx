import type { Metadata } from 'next'
import FavoritosClient from './favoritos-client'

export const metadata: Metadata = {
  title: 'Favoritos · Rodeo',
  description: 'Tus lotes guardados para seguir el remate.',
}

export default function FavoritosPage() {
  return <FavoritosClient />
}
