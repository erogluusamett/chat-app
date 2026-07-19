import { cn, formatMessageTime } from '@/utils'
import type { Message } from '@/types'
import { Check, CheckCheck } from 'lucide-react'

interface Props {
    message: Message
    isMine: boolean
}

export default function MessageBubble({ message, isMine }: Props) {
    return (
        <div className={cn('flex animate-fade-in', isMine ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[70%] px-4 py-2.5 text-sm leading-relaxed',
                    isMine ? 'bubble-sent' : 'bubble-received'
                )}
            >
                {!isMine && (
                    <p className="text-xs font-medium text-brand-400 mb-1">
                        {message.sender?.displayName ?? message.sender?.username}
                    </p>
                )}
                <p className="break-words">{message.content}</p>
                <div className={cn('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start')}>
          <span className={cn('text-[10px]', isMine ? 'text-white/50' : 'text-slate-500')}>
            {formatMessageTime(message.createdAt)}
          </span>
                    {isMine && (
                        message.status === 'READ'
                            ? <CheckCheck size={12} className="text-brand-300" />
                            : <Check size={12} className="text-white/40" />
                    )}
                </div>
            </div>
        </div>
    )
}