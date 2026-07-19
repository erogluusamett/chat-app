import { useState, type KeyboardEvent } from 'react'
import { Send, Smile } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useTyping } from '@/hooks/useTyping'
import { sendMessage } from '@/services/socketService'
import { cn } from '@/utils'
import { toast } from 'react-hot-toast'

export default function MessageInput() {
  const [text, setText] = useState('')
  const { activeConversationId, conversations } = useChatStore()
  const myId = useAuthStore((s) => s.user?.id)
  const { startTyping, stopTyping } = useTyping(activeConversationId)

  const conv = conversations.find((c) => c.id === activeConversationId)

  const handleSend = () => {
    const content = text.trim()
    if (!content || !activeConversationId) return
    try {
      sendMessage(activeConversationId, content)
      setText('')
      stopTyping()
    } catch {
      toast.error('Mesaj gönderilemedi')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (value: string) => {
    setText(value)
    if (value.trim()) startTyping()
    else stopTyping()
  }

  return (
    <div className="flex items-end gap-3 px-5 py-4 border-t border-white/5 bg-surface-900/30 flex-shrink-0">
      <div className="flex-1 flex items-end gap-2 bg-surface-800/80 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-150">
        <textarea
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none leading-relaxed max-h-32 min-h-[24px]"
          rows={1}
          placeholder="Mesaj yaz…"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 pb-0.5">
          <Smile size={18} />
        </button>
      </div>

      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className={cn(
          'flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-150',
          text.trim()
            ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-600/30'
            : 'bg-surface-800 text-slate-600 cursor-not-allowed'
        )}
      >
        <Send size={18} />
      </button>
    </div>
  )
}
