import { useChatStore } from '@/stores/chatStore'
import { chatService } from '@/services/chatService'
import { toast } from 'react-hot-toast'
import type { User } from '@/types'
import Avatar from '@/components/ui/Avatar'

interface Props {
    onlineUsers: User[]
    allUsers: User[]
}

export default function UserList({ onlineUsers, allUsers }: Props) {
    const { addConversation, setActiveConversation } = useChatStore()
    const myId = JSON.parse(localStorage.getItem('chat_auth') || '{}')?.state?.user?.id

    const handleStartChat = async (user: User) => {
        try {
            const conv = await chatService.startConversation(user.id)
            addConversation(conv)
            setActiveConversation(conv.id)
        } catch {
            toast.error('Sohbet başlatılamadı')
        }
    }

    const otherUsers = allUsers.filter((u) => u.id !== myId)
    const onlineIds = new Set(onlineUsers.map((u) => u.id))

    const online  = otherUsers.filter((u) => onlineIds.has(u.id))
    const offline = otherUsers.filter((u) => !onlineIds.has(u.id))

    return (
        <div className="py-2">
            {/* Çevrimiçi */}
            {online.length > 0 && (
                <>
                    <p className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Çevrimiçi — {online.length}
                    </p>
                    {online.map((user) => (
                        <UserItem key={user.id} user={user} online onClick={() => handleStartChat(user)} />
                    ))}
                </>
            )}

            {/* Çevrimdışı */}
            {offline.length > 0 && (
                <>
                    <p className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-2">
                        Çevrimdışı — {offline.length}
                    </p>
                    {offline.map((user) => (
                        <UserItem key={user.id} user={user} online={false} onClick={() => handleStartChat(user)} />
                    ))}
                </>
            )}

            {otherUsers.length === 0 && (
                <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-slate-600">Henüz başka kullanıcı yok</p>
                </div>
            )}
        </div>
    )
}

function UserItem({ user, online, onClick }: { user: User; online: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
        >
            <Avatar username={user.displayName ?? user.username} online={online} size="sm" />
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                    {user.displayName ?? user.username}
                </p>
                <p className="text-xs text-slate-500 truncate">
                    {online ? 'Çevrimiçi' : user.lastSeenAt ? `Son görülme: ${new Date(user.lastSeenAt).toLocaleDateString('tr-TR')}` : 'Çevrimdışı'}
                </p>
            </div>
        </button>
    )
}