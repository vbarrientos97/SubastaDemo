import { LotScreen } from '@/components/auction/lot-screen'

export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LotScreen id={id} />
}
