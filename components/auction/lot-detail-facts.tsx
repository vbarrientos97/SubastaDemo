import { formatLotBirthDate, type Lot } from '@/lib/domain/lot'

export function LotDetailFacts({ lot }: { lot: Pick<Lot, 'breed' | 'color' | 'birthDate' | 'weightKg' | 'sire' | 'dam'> }) {
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
      <div><dt className="text-muted-foreground">Raza</dt><dd className="mt-1 font-semibold">{lot.breed || '—'}</dd></div>
      <div><dt className="text-muted-foreground">Color</dt><dd className="mt-1 font-semibold">{lot.color ?? '—'}</dd></div>
      <div><dt className="text-muted-foreground">Nacimiento</dt><dd className="mt-1 font-semibold">{formatLotBirthDate(lot.birthDate)}</dd></div>
      <div><dt className="text-muted-foreground">Peso</dt><dd className="mt-1 font-semibold">{lot.weightKg.toLocaleString('es-CR')} kg</dd></div>
      <div><dt className="text-muted-foreground">Padre</dt><dd className="mt-1 font-semibold">{lot.sire ?? '—'}</dd></div>
      <div><dt className="text-muted-foreground">Madre</dt><dd className="mt-1 font-semibold">{lot.dam ?? '—'}</dd></div>
    </dl>
  )
}
