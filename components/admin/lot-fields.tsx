'use client'

import { ChevronDown } from 'lucide-react'
import { displayedPrice, lotBirthDateInputValue, LOT_COLORS, type Lot, type LotInput, type LotCategory, type LotColor, type LotStatus } from '@/lib/domain/lot'
import { field, selectField } from '@/lib/styles'
import { cn } from '@/lib/utils'

export const emptyLotDraft = {
  breed: '',
  category: 'macho' as LotCategory,
  price: '',
  status: 'upcoming' as LotStatus,
  seller: '',
  color: '' as LotColor | '',
  birthDate: '',
  sire: '',
  dam: '',
  youtubeUrl: '',
  image1: '',
  image2: '',
  image3: '',
  image4: '',
}

export function LotFields({ draft, onChange, detailsOpen, onToggleDetails }: {
  draft: typeof emptyLotDraft
  onChange: (draft: typeof emptyLotDraft) => void
  detailsOpen: boolean
  onToggleDetails: () => void
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
          Raza
          <input value={draft.breed} onChange={(event) => onChange({ ...draft, breed: event.target.value })} className={field} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
          Color
          <select value={draft.color} onChange={(event) => onChange({ ...draft, color: event.target.value as LotColor | '' })} className={selectField} required>
            <option value="">Elige un color</option>
            {LOT_COLORS.map((color) => <option key={color} value={color}>{color}</option>)}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
          Nacimiento
          <input type="date" value={draft.birthDate} onChange={(event) => onChange({ ...draft, birthDate: event.target.value })} className={field} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
          Vendedor
          <input value={draft.seller} onChange={(event) => onChange({ ...draft, seller: event.target.value })} className={field} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
          Sexo
          <select value={draft.category} onChange={(event) => onChange({ ...draft, category: event.target.value as LotCategory })} className={selectField}>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
          Precio
          <input inputMode="numeric" value={draft.price} onChange={(event) => onChange({ ...draft, price: event.target.value })} className={field} />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <button
          type="button"
          aria-expanded={detailsOpen}
          onClick={onToggleDetails}
          className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold text-foreground transition hover:bg-accent"
        >
          <span>Datos adicionales</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', detailsOpen && 'rotate-180')} />
        </button>
        {detailsOpen ? (
          <div className="grid grid-cols-1 gap-3 border-t border-border p-3 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Padre
              <input value={draft.sire} onChange={(event) => onChange({ ...draft, sire: event.target.value })} className={field} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              Madre
              <input value={draft.dam} onChange={(event) => onChange({ ...draft, dam: event.target.value })} className={field} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
              YouTube
              <input value={draft.youtubeUrl} onChange={(event) => onChange({ ...draft, youtubeUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=…" className={field} />
            </label>
            {(['image1', 'image2', 'image3', 'image4'] as const).map((key, index) => (
              <label key={key} className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-foreground">
                {index === 3 ? 'Foto 4 · Certificado (opcional)' : `Foto ${index + 1} (opcional)`}
                <input value={draft[key]} onChange={(event) => onChange({ ...draft, [key]: event.target.value })} placeholder="Opcional · /cattle/… o https://" className={field} />
              </label>
            ))}
          </div>
        ) : null}
      </div>

    </>
  )
}

export function lotDraftFromLot(lot: Lot): typeof emptyLotDraft {
  const photos = lot.images ?? [lot.image]
  return {
    breed: lot.breed,
    category: lot.category,
    price: String(displayedPrice(lot)),
    status: lot.status,
    seller: lot.seller ?? '',
    color: (lot.color ?? '') as LotColor | '',
    birthDate: lotBirthDateInputValue(lot.birthDate),
    sire: lot.sire ?? '',
    dam: lot.dam ?? '',
    youtubeUrl: lot.youtubeUrl ?? '',
    image1: photos[0] ?? '',
    image2: photos[1] ?? '',
    image3: photos[2] ?? '',
    image4: photos[3] ?? '',
  }
}

export function lotInputFromDraft(draft: typeof emptyLotDraft, editing: boolean): LotInput {
  return {
    title: draft.breed,
    breed: draft.breed,
    category: draft.category,
    price: Number(draft.price),
    status: editing ? draft.status : 'upcoming',
    seller: draft.seller,
    color: draft.color,
    birthDate: draft.birthDate,
    sire: draft.sire,
    dam: draft.dam,
    youtubeUrl: draft.youtubeUrl,
    images: [draft.image1, draft.image2, draft.image3, draft.image4],
  }
}
