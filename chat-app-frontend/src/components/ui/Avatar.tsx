import { cn, getInitials, avatarColor } from '@/utils'

interface AvatarProps {
  username: string
  avatarUrl?: string
  online?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
}

const dotSizes = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
}

export default function Avatar({ username, avatarUrl, online, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className={cn('rounded-full object-cover', sizes[size])}
        />
      ) : (
        <div
          className={cn('rounded-full flex items-center justify-center font-semibold text-white select-none', sizes[size])}
          style={{ backgroundColor: avatarColor(username) }}
        >
          {getInitials(username)}
        </div>
      )}

      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-surface-950',
            dotSizes[size],
            online ? 'bg-emerald-400' : 'bg-slate-600'
          )}
        />
      )}
    </div>
  )
}
