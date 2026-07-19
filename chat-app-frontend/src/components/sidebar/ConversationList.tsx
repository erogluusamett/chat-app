import { useChatStore } from '@/stores/chatStore'
import { useMessages } from '@/hooks/useMessages'
import ConversationItem from './ConversationItem'

/**
 * Aktif konuşma değiştiğinde mesajları otomatik yükler.
 * Ayrı component olarak tutulur ki hook convId değiştiğinde doğru tetiklensin.
 */
function ActiveConversationLoader({ convId }: { convId: number }) {
  useMessages(convId)
  return null
}

export default function ConversationList() {
  const { conversations, setActiveConversation, activeConversationId } = useChatStore()

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 px-4 text-center">
        <p className="text-sm text-slate-600">Henüz sohbet yok</p>
        <p className="text-xs text-slate-700">Sağ üstteki 🔍 ikonuna tıkla ve birini ara</p>
      </div>
    )
  }

  return (
    <ul className="py-2">
      {activeConversationId && (
        <ActiveConversationLoader convId={activeConversationId} />
      )}

      {conversations
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onSelect={() => setActiveConversation(conv.id)}
          />
        ))}
    </ul>
  )
}
