import { LOT_COLORS, type LotColor } from '@/lib/domain/lot'

export function demoLotColor(breed: string, order: number): LotColor {
  const colorsByBreed: Record<string, readonly LotColor[]> = {
    Angus: ['Negro', 'Colorado'],
    Brahman: ['Gris', 'Blanco', 'Colorado'],
    Brangus: ['Negro', 'Pinto negro', 'Colorado'],
    Gyr: ['Colorado', 'Rojo', 'Amarillo'],
    Hereford: ['Pinto colorado', 'Colorado'],
    Holstein: ['Pinto negro', 'Blanco'],
    Nelore: ['Blanco', 'Gris'],
  }
  const colors = colorsByBreed[breed] ?? LOT_COLORS
  return colors[(Math.max(1, order) - 1) % colors.length]
}

export function demoLotBirthDate(order: number): string {
  const year = 2019 + (order % 5)
  const month = ((order * 3 - 1) % 12) + 1
  const day = ((order * 7 - 1) % 28) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

