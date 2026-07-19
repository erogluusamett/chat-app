import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { userService } from '@/services/userService'
import { chatService } from '@/services/chatService'
import { useChatStore } from '@/stores/chatStore'
import { toast } from 'react-hot-toast'
import type { User } from '@/types'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'

export default function UserSearch() {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { addConversation, setActiveConversation } = useChatStore()

  // Dropdown açıldığında input'a odaklan
  useEffect(() => {
    if (open) inputRef.current?.focus()
    else { setQuery(''); setResults([]) }
  }, [open])

  // Debounce ile arama
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await userService.search(query)
        setResults(data)
      } catch {
        toast.error('Arama başarısız')
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [query])

  const handleSelect = async (user: User) => {
    try {
      const conv = await chatService.startConversation(user.id)
      addConversation(conv)
      setActiveConversation(conv.id)
      setOpen(false)
    } catch {
      toast.error('Sohbet başlatılamadı')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        title="Yeni sohbet"
      >
        <Search size={18} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-10 z-20 w-72 glass rounded-xl shadow-glass animate-slide-up overflow-hidden">
            {/* Arama kutusu */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
              <Search size={15} className="text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                placeholder="Kullanıcı ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-600 hover:text-slate-400">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sonuçlar */}
            <div className="max-h-60 overflow-y-auto scroll-hide">
              {loading && (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              )}

              {!loading && results.length === 0 && query && (
                <p className="text-center text-xs text-slate-600 py-4">Kullanıcı bulunamadı</p>
              )}

              {!loading && results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                >
                  <Avatar username={user.username} avatarUrl={user.avatarUrl} online={user.online} size="xs" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate">{user.username}</p>
                    <p className="text-xs text-slate-600 truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
