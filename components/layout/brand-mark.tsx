import { cn } from '@/lib/utils'
import Image from 'next/image'

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      width={40}
      height={40}
      src="/logo-mark.jpg"
      alt="Subasta Ganadera Panamá"
      className={cn(
        'h-10 w-10 shrink-0 rounded-xl bg-surface object-contain dark:bg-white',
        className,
      )}
    />
  )
}
