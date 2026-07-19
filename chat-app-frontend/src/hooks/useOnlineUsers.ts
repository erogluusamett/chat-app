import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'

/**
 * Tüm konuşmalardaki çevrimiçi kullanıcı ID'lerini döner.
 * socketService.ts zaten online/offline event'lerini chatStore'a yazıyor;
 * bu hook sadece güncel listeyi türetir.
 */
export function useOnlineUsers(): number[] {
  const conversations = useChatStore((s) => s.conversations)
  const myId = useAuthStore((s) => s.user?.id)

  return conversations
    .filter((c) => c.participant.online && c.participant.id !== myId)
    .map((c) => c.participant.id)
}

/** Belirli bir kullanıcının çevrimiçi olup olmadığını döner */
export function useIsOnline(userId: number): boolean {
  const conversations = useChatStore((s) => s.conversations)
  const conv = conversations.find((c) => c.participant.id === userId)
  return conv?.participant.online ?? false
}
