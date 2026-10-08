import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo-mark.jpg"
      alt="Subasta Ganadera Panamá"
      className={cn(
        'h-10 w-10 shrink-0 rounded-xl bg-white object-contain',
        className,
      )}
    />
  )
}
