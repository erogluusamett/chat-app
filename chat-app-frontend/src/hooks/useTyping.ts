import { useRef, useCallback } from 'react'
import { sendTyping } from '@/services/socketService'

/**
 * Mesaj kutusunda kullanılır.
 * startTyping → debounce ile stopTyping gönderir.
 */
export function useTyping(conversationId: number | null) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const startTyping = useCallback(() => {
    if (!conversationId) return

    if (!isTypingRef.current) {
      sendTyping(conversationId, true)
      isTypingRef.current = true
    }

    // Önceki timer'ı sıfırla
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // 2 saniye yazılmazsa "yazmayı bıraktı" gönder
    timeoutRef.current = setTimeout(() => {
      sendTyping(conversationId, false)
      isTypingRef.current = false
    }, 2000)
  }, [conversationId])

  const stopTyping = useCallback(() => {
    if (!conversationId || !isTypingRef.current) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    sendTyping(conversationId, false)
    isTypingRef.current = false
  }, [conversationId])

  return { startTyping, stopTyping }
}
