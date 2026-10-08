import { cn } from '@/lib/utils'

export function SoldStamp({
  paddle,
  size = 'md',
  placement = 'center',
}: {
  paddle?: number
  size?: 'sm' | 'md' | 'lg'
  placement?: 'center' | 'end'
}) {
  const lg = size === 'lg'
  const sm = size === 'sm'

  return (
    <div
      className={cn(
        'pointer-events-none absolute -rotate-[14deg] select-none',
        placement === 'end'
          ? 'right-3 top-16 z-20'
          : cn('left-1/2 z-10 -translate-x-1/2', lg ? 'top-[34%]' : 'top-[38%]'),
      )}
      aria-hidden
    >
      <div
        className={cn(
          'flex flex-col items-center border-double border-primary bg-black/45 text-primary shadow-[0_8px_18px_rgba(0,0,0,0.45)] backdrop-blur-[2px]',
          sm ? 'gap-0.5 rounded border-2 px-2 py-1' : 'rounded-md border-4',
          lg ? 'gap-1 px-7 py-3' : sm ? '' : 'gap-0.5 px-4 py-1.5',
        )}
      >
        <span
          className={cn(
            'font-display font-black uppercase leading-none tracking-[0.22em]',
            lg ? 'text-4xl tracking-[0.28em]' : sm ? 'text-[11px]' : 'text-xl',
          )}
        >
          Vendido
        </span>
        <span className="h-px w-full bg-primary" />
        <span
          className={cn(
            'font-bold uppercase tracking-[0.16em]',
            lg ? 'text-sm tracking-[0.22em]' : sm ? 'text-[8px]' : 'text-[10px]',
          )}
        >
          {paddle != null ? `Paleta #${paddle}` : 'Adjudicado'}
        </span>
      </div>
    </div>
  )
}
