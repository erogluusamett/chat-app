import { cn } from '@/utils'

interface BadgeProps {
  count: number
  max?: number
  className?: string
}

export default function Badge({ count, max = 99, className }: BadgeProps) {
  if (count <= 0) return null
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1',
        'rounded-full bg-brand-600 text-white text-[10px] font-semibold',
        className
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  )
}
