export type RegionId = 'boqueron' | 'azuero' | 'torti' | 'cocle'

export type RegionInk = 'green' | 'red' | 'blue' | 'black'

export type Region = {
  id: RegionId
  name: string
  ink: RegionInk
}

export const regions: readonly Region[] = [
  { id: 'boqueron', name: 'Boquerón', ink: 'green' },
  { id: 'azuero', name: 'Azuero y Veraguas', ink: 'red' },
  { id: 'torti', name: 'Tortí, Chepo y Darién', ink: 'blue' },
  { id: 'cocle', name: 'Coclé', ink: 'black' },
]

export function regionById(id: RegionId) {
  return regions.find((region) => region.id === id) ?? regions[0]
}

export function isRegionId(value: string): value is RegionId {
  return regions.some((region) => region.id === value)
}
