import type { Lot } from '@/lib/domain/lot'
import type { BuyerLot } from '@/lib/domain/buyer-lot'
import { TopBar } from '@/components/layout/top-bar'
import { BackLink } from '@/components/layout/back-link'
import { LiveGallery } from '@/components/auction/live-gallery'
import { LotDetailFacts } from '@/components/auction/lot-detail-facts'

export function PublicLotDetails({ lot, backHref, historyBack }: { lot: Lot | BuyerLot; backHref: string; historyBack: boolean }) {
  return (
    <>
      <TopBar title={`Lote ${String(lot.order).padStart(2, '0')}`} backHref={backHref} backHistory={historyBack} />
      <main className="flex flex-col gap-4 px-4 py-4 lg:mx-auto lg:max-w-4xl lg:px-6 lg:py-6">
        <div className="hidden lg:block"><BackLink href={backHref} historyBack={historyBack} /></div>
        <div className="overflow-hidden rounded-2xl">
          <LiveGallery image={lot.image} images={lot.images} title={`Lote ${lot.order}`} youtubeUrl={lot.youtubeUrl} />
        </div>
        <h1 className="font-display text-2xl font-bold">Lote {String(lot.order).padStart(2, '0')}</h1>
        <LotDetailFacts lot={lot} />
      </main>
    </>
  )
}
