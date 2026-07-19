import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { connectSocket, disconnectSocket, isConnected } from '@/services/socketService'
import { useAuthStore } from '@/stores/authStore'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isAuth = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuth) return

    const connect = async () => {
      if (isConnected()) { setConnected(true); return }
      setConnecting(true)
      try {
        await connectSocket()
        setConnected(true)
      } catch {
        toast.error('Sunucuya bağlanılamadı, yeniden deneniyor…')
        // 5 saniye sonra tekrar dene
        retryRef.current = setTimeout(connect, 5000)
      } finally {
        setConnecting(false)
      }
    }

    connect()

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current)
      disconnectSocket()
      setConnected(false)
    }
  }, [isAuth])

  return { connected, connecting }
}
