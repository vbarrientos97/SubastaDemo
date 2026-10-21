export type RegionId = 'boqueron' | 'azuero' | 'torti' | 'cocle'

export type Region = {
  id: RegionId
  name: string
}

export const regions: readonly Region[] = [
  { id: 'boqueron', name: 'Boquerón' },
  { id: 'azuero', name: 'Azuero y Veraguas' },
  { id: 'torti', name: 'Tortí, Chepo y Darién' },
  { id: 'cocle', name: 'Coclé' },
]

export function regionById(id: RegionId) {
  return regions.find((region) => region.id === id) ?? regions[0]
}

export function isRegionId(value: string): value is RegionId {
  return regions.some((region) => region.id === value)
}
