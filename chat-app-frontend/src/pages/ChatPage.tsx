import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { chatService } from '@/services/chatService'
import { userService } from '@/services/userService'
import { useWebSocket } from '@/hooks/useWebSocket'
import { toast } from 'react-hot-toast'
import { MessageSquare, Users, LogOut, UserCircle } from 'lucide-react'

import ConversationList from '@/components/sidebar/ConversationList'
import UserSearch from '@/components/sidebar/UserSearch'
import UserList from '@/components/sidebar/UserList'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import ChatHeader from '@/components/chat/ChatHeader'
import EmptyState from '@/components/chat/EmptyState'
import ConnectionStatus from '@/components/ui/ConnectionStatus'
import Avatar from '@/components/ui/Avatar'

export default function ChatPage() {
  const navigate = useNavigate()
  const { activeConversationId, setConversations } = useChatStore()
  const { user } = useAuthStore()
  const { connected, connecting } = useWebSocket()
  const [tab, setTab] = useState<'chats' | 'users'>('chats')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])

  useEffect(() => {
    chatService.getConversations()
        .then(setConversations)
        .catch(() => toast.error('Konuşmalar yüklenemedi'))
  }, [setConversations])

  useEffect(() => {
    userService.getOnlineUsers().then(setOnlineUsers).catch(() => {})
    userService.search('').then(setAllUsers).catch(() => {})
  }, [])

  return (
      <div className="flex h-screen-dvh overflow-hidden bg-surface-950">

        {/* ─── Sol panel ───────────────────────────────────────── */}
        <aside className="flex flex-col w-[var(--sidebar-w)] flex-shrink-0 border-r border-white/5 bg-surface-900/50">

          {/* Üst: kullanıcı profili */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <Avatar username={user?.username ?? '?'} size="sm" />
              <div className="text-left">
                <p className="text-sm font-medium text-white leading-tight">{user?.displayName ?? user?.username}</p>
                <p className="text-xs text-emerald-400">Çevrimiçi</p>
              </div>
            </button>
            <div className="flex items-center gap-1">
              <ConnectionStatus connected={connected} connecting={connecting} />
              <button
                  onClick={() => navigate('/profile')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <UserCircle size={18} />
              </button>
            </div>
          </div>

          {/* Tab'lar */}
          <div className="flex border-b border-white/5">
            <button
                onClick={() => setTab('chats')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    tab === 'chats'
                        ? 'text-white border-b-2 border-brand-500'
                        : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <MessageSquare size={15} />
              Sohbetler
            </button>
            <button
                onClick={() => setTab('users')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    tab === 'users'
                        ? 'text-white border-b-2 border-brand-500'
                        : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Users size={15} />
              Kullanıcılar
            </button>
          </div>

          {/* Arama */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {tab === 'chats' ? 'Mesajlar' : 'Tüm Kullanıcılar'}
          </span>
            <UserSearch />
          </div>

          {/* İçerik */}
          <div className="flex-1 overflow-y-auto scroll-hide">
            {tab === 'chats' ? (
                <ConversationList />
            ) : (
                <UserList onlineUsers={onlineUsers} allUsers={allUsers} />
            )}
          </div>
        </aside>

        {/* ─── Sağ panel ───────────────────────────────────────── */}
        <main className="flex flex-col flex-1 min-w-0">
          {activeConversationId ? (
              <>
                <ChatHeader />
                <div className="flex-1 overflow-y-auto">
                  <MessageList />
                </div>
                <MessageInput />
              </>
          ) : (
              <EmptyState />
          )}
        </main>
      </div>
  )
}