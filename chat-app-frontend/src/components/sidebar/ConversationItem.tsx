import { cn, formatMessageTime, truncate } from '@/utils'
import type { Conversation } from '@/types'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'

interface Props {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
}

export default function ConversationItem({ conversation, isActive, onSelect }: Props) {
  const myId = JSON.parse(localStorage.getItem('chat_auth') || '{}')?.state?.user?.id
  const participant = conversation.members?.find((m) => m.id !== myId)
  const displayName = participant?.displayName ?? participant?.username ?? conversation.name
  const isOnline = participant?.status === 'ONLINE'
  const lastMessage = conversation.lastMessage
  const unreadCount = conversation.unreadCount ?? 0

  return (
      <li
          onClick={onSelect}
          className={cn(
              'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-100',
              isActive
                  ? 'bg-brand-600/15 border-l-2 border-brand-500'
                  : 'border-l-2 border-transparent hover:bg-white/[0.04]'
          )}
      >
        <Avatar username={displayName ?? '?'} online={isOnline} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
          <span className={cn('text-sm truncate', isActive ? 'font-semibold text-white' : 'font-medium text-slate-200')}>
            {displayName}
          </span>
            {lastMessage && (
                <span className="text-[11px] text-slate-600 flex-shrink-0">
              {formatMessageTime(lastMessage.createdAt)}
            </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-xs text-slate-500 truncate">
              {lastMessage ? truncate(lastMessage.content, 35) : 'Sohbet başlat'}
            </p>
            {!isActive && <Badge count={unreadCount} />}
          </div>
        </div>
      </li>
  )
}