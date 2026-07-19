import { useState, type ReactNode } from 'react'
import { cn } from '@/utils'

interface TooltipProps {
  label: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const positions = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
}

export default function Tooltip({ label, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className={cn(
            'absolute z-50 px-2 py-1 text-xs text-white bg-surface-800 border border-white/10 rounded-lg whitespace-nowrap pointer-events-none animate-fade-in',
            positions[position]
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}
