import { useState, useEffect, useRef } from 'react'
import { MoreVertical, Trash2, BellOff, Bell, UserX, Info } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { subscribeRoom } from '@/services/socketService'
import { toast } from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'

export default function ChatHeader() {
  const { conversations, activeConversationId } = useChatStore()
  const conv = conversations.find((c) => c.id === activeConversationId)

  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeConversationId) return
    const unsubscribe = subscribeRoom(activeConversationId)
    return () => unsubscribe()
  }, [activeConversationId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!conv) return null

  const myId = JSON.parse(localStorage.getItem('chat_auth') || '{}')?.state?.user?.id
  const participant = conv.members?.find((m) => m.id !== myId)
  const displayName = participant?.displayName ?? participant?.username ?? conv.name
  const isOnline = participant?.status === 'ONLINE'

  const handleClearChat = async () => {
    if (!window.confirm('Sohbet temizlensin mi?')) return
    try {
      await fetch(`/api/messages/room/${activeConversationId}/clear`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('chat_auth') || '{}')?.state?.token
        }
      })
      useChatStore.getState().setMessages(activeConversationId!, [])
      toast.success('Sohbet temizlendi')
    } catch {
      toast.error('Sohbet temizlenemedi')
    }
    setMenuOpen(false)
  }

  const handleBlockUser = () => {
    if (!window.confirm(`${displayName} engellensin mi?`)) return
    const convs = useChatStore.getState().conversations.filter(
        (c) => c.id !== activeConversationId
    )
    useChatStore.getState().setConversations(convs)
    useChatStore.getState().setActiveConversation(null)
    toast.success(`${displayName} engellendi`)
    setMenuOpen(false)
  }

  return (
      <>
        <header className="flex items-center justify-between px-5 h-[var(--header-h)] border-b border-white/5 bg-surface-900/40 flex-shrink-0">
          {/* Sol: kullanıcı bilgisi */}
          <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar username={displayName ?? '?'} online={isOnline} size="sm" />
            <div className="text-left">
              <p className="font-medium text-white text-sm leading-tight">{displayName}</p>
              <p className="text-xs text-slate-500">{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</p>
            </div>
          </button>

          {/* Sağ: aksiyonlar */}
          <div className="flex items-center gap-1" ref={menuRef}>
            <div className="relative">
              <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                  <div className="absolute right-0 top-10 z-50 w-52 glass rounded-xl shadow-glass py-1 animate-slide-up">
                    <button
                        onClick={() => { setProfileOpen(true); setMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Info size={15} className="text-slate-500" />
                      Profili Görüntüle
                    </button>

                    <button
                        onClick={() => { setMuted((v) => !v); setMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {muted
                          ? <Bell size={15} className="text-slate-500" />
                          : <BellOff size={15} className="text-slate-500" />
                      }
                      {muted ? 'Bildirimleri Aç' : 'Bildirimleri Kapat'}
                    </button>

                    <div className="my-1 border-t border-white/5" />

                    <button
                        onClick={handleClearChat}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Trash2 size={15} className="text-slate-500" />
                      Sohbeti Temizle
                    </button>

                    <button
                        onClick={handleBlockUser}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <UserX size={15} />
                      Kullanıcıyı Engelle
                    </button>
                  </div>
              )}
            </div>
          </div>
        </header>

        {/* Karşı kullanıcı profil modali */}
        {participant && (
            <Modal open={profileOpen} onClose={() => setProfileOpen(false)} size="sm">
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative">
                  <Avatar username={displayName ?? '?'} size="lg" />
                  <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface-900 ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>

                <div className="text-center">
                  <h2 className="text-lg font-semibold text-white">{displayName}</h2>
                  <p className="text-sm text-slate-500">@{participant.username}</p>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isOnline ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {isOnline ? 'Şu an çevrimiçi' : 'Çevrimdışı'}
                </div>

                <div className="w-full bg-surface-800/60 rounded-xl divide-y divide-white/5">
                  {participant.email && (
                      <div className="flex justify-between px-4 py-3">
                        <span className="text-xs text-slate-500">E-posta</span>
                        <span className="text-xs text-slate-300">{participant.email}</span>
                      </div>
                  )}
                  {participant.bio && (
                      <div className="flex justify-between px-4 py-3">
                        <span className="text-xs text-slate-500">Hakkında</span>
                        <span className="text-xs text-slate-300 text-right max-w-[60%]">{participant.bio}</span>
                      </div>
                  )}
                  {participant.createdAt && (
                      <div className="flex justify-between px-4 py-3">
                        <span className="text-xs text-slate-500">Kayıt tarihi</span>
                        <span className="text-xs text-slate-300">
                    {new Date(participant.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                      </div>
                  )}
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-xs text-slate-500">Son görülme</span>
                    <span className="text-xs text-slate-300">
                  {participant.lastSeenAt
                      ? new Date(participant.lastSeenAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })
                      : 'Bilinmiyor'}
                </span>
                  </div>
                </div>

                <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full h-10 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Mesaj Gönder
                </button>
              </div>
            </Modal>
        )}
      </>
  )
}