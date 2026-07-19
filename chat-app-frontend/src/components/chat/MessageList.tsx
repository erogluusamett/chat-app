import { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useMessages } from '@/hooks/useMessages'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import Spinner from '@/components/ui/Spinner'

export default function MessageList() {
  const bottomRef    = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevLenRef   = useRef(0)

  const { activeConversationId, messages, typingUsers } = useChatStore()
  const myId = useAuthStore((s) => s.user?.id)
  const { loading, loadingMore, hasMore, loadMore } = useMessages(activeConversationId)

  const msgs = activeConversationId ? (messages[activeConversationId] ?? []) : []

  // Sadece başkası yazıyorsa göster
  const isTyping = activeConversationId
      ? (typingUsers[activeConversationId] ?? []).filter((id) => id !== myId).length > 0
      : false

  useEffect(() => {
    if (loading) return
    if (msgs.length > prevLenRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevLenRef.current = msgs.length
  }, [msgs.length, loading])

  useEffect(() => {
    if (isTyping) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isTyping])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el || loadingMore || !hasMore) return
    if (el.scrollTop < 60) loadMore()
  }, [loadingMore, hasMore, loadMore])

  if (!activeConversationId) return null

  // Mesajları eskiden yeniye sırala
  const sortedMsgs = [...msgs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
      <div
          ref={containerRef}
          className="flex flex-col gap-1 px-5 py-4 h-full overflow-y-auto"
          onScroll={handleScroll}
      >
        {loadingMore && (
            <div className="flex justify-center py-2">
              <Spinner size="sm" />
            </div>
        )}

        {loading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner />
            </div>
        ) : sortedMsgs.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-slate-600">Henüz mesaj yok. İlk mesajı gönder!</p>
            </div>
        ) : (
            sortedMsgs.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMine={msg.sender?.id === myId}
                />
            ))
        )}

        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
  )
}