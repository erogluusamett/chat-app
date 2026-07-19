import { cn } from '@/utils'
import Tooltip from './Tooltip'

interface Props {
  connected: boolean
  connecting: boolean
}

export default function ConnectionStatus({ connected, connecting }: Props) {
  const label = connecting ? 'Bağlanıyor…' : connected ? 'Bağlı' : 'Bağlantı kesildi'

  return (
    <Tooltip label={label} position="right">
      <span
        className={cn(
          'w-2 h-2 rounded-full transition-colors duration-300',
          connecting && 'bg-amber-400 animate-pulse',
          !connecting && connected && 'bg-emerald-400',
          !connecting && !connected && 'bg-red-500'
        )}
      />
    </Tooltip>
  )
}
