import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { chatService } from '@/services/chatService'
import { useChatStore } from '@/stores/chatStore'

export function useMessages(conversationId: number | null) {
  const [loading, setLoading]         = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage]               = useState(0)
  const [hasMore, setHasMore]         = useState(true)
  const loadedRef = useRef<Set<number>>(new Set())

  const { setMessages, prependMessages } = useChatStore()

  // convId değiştiğinde ilk yüklemeyi otomatik tetikle
  useEffect(() => {
    if (!conversationId) return

    // Zaten bu konuşma yüklendiyse tekrar yükleme
    if (loadedRef.current.has(conversationId)) return

    let cancelled = false
    setLoading(true)
    setPage(0)
    setHasMore(true)

    chatService.getMessages(conversationId, 0)
      .then((data) => {
        if (cancelled) return
        setMessages(conversationId, [...data.content].reverse())
        setHasMore(!data.last)
        setPage(1)
        loadedRef.current.add(conversationId)
      })
      .catch(() => {
        if (!cancelled) toast.error('Mesajlar yüklenemedi')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [conversationId, setMessages])

  // Scroll tepesine gelince eski mesajları yükle
  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await chatService.getMessages(conversationId, page)
      prependMessages(conversationId, [...data.content].reverse())
      setHasMore(!data.last)
      setPage((p) => p + 1)
    } catch {
      toast.error('Eski mesajlar yüklenemedi')
    } finally {
      setLoadingMore(false)
    }
  }, [conversationId, hasMore, loadingMore, page, prependMessages])

  return { loading, loadingMore, hasMore, loadMore }
}
