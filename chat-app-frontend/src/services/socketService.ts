import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { WS_DESTINATIONS } from '@/constants'
import { useChatStore } from '@/stores/chatStore'
import type { Message, TypingPayload, OnlinePayload } from '@/types'

let client: Client | null = null
const subscriptions: StompSubscription[] = []

const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem('chat_auth')
    if (!raw) return null
    return JSON.parse(raw)?.state?.token ?? null
  } catch { return null }
}

const getUserId = (): number | null => {
  try {
    const raw = localStorage.getItem('chat_auth')
    if (!raw) return null
    return JSON.parse(raw)?.state?.user?.id ?? null
  } catch { return null }
}

export const connectSocket = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const userId = getUserId()
    if (!token || !userId) return reject(new Error('Oturum açılmamış'))

    client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        _subscribeGlobal()
        resolve()
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame)
        reject(new Error(frame.headers['message']))
      },
    })

    client.activate()
  })
}

export const disconnectSocket = (): void => {
  subscriptions.forEach((s) => s.unsubscribe())
  subscriptions.length = 0
  client?.deactivate()
  client = null
}

export const sendMessage = (roomId: number, content: string): void => {
  if (!client?.connected) throw new Error('WebSocket bağlı değil')
  client.publish({
    destination: WS_DESTINATIONS.SEND_MESSAGE,
    body: JSON.stringify({ roomId, content, messageType: 'TEXT' }),
  })
}

export const sendTyping = (roomId: number, typing: boolean): void => {
  if (!client?.connected) return
  client.publish({
    destination: WS_DESTINATIONS.TYPING,
    body: JSON.stringify({ roomId, typing }),
  })
}

export const sendRead = (roomId: number): void => {
  if (!client?.connected) return
  client.publish({
    destination: WS_DESTINATIONS.READ,
    body: JSON.stringify({ roomId }),
  })
}

function _subscribeGlobal() {
  if (!client) return

  const onlineSub = client.subscribe(
      WS_DESTINATIONS.ONLINE_TOPIC,
      (frame: IMessage) => {
        try {
          const raw = JSON.parse(frame.body)
          const payload: OnlinePayload = raw?.payload ?? raw
          const convs = useChatStore.getState().conversations.map((c) => ({
            ...c,
            members: c.members?.map((m) =>
                m.id === payload.userId
                    ? { ...m, status: payload.status ?? (payload.online ? 'ONLINE' : 'OFFLINE') }
                    : m
            ),
          }))
          useChatStore.getState().setConversations(convs)
        } catch (e) {
          console.error('Online payload parse hatası', e)
        }
      }
  )

  subscriptions.push(onlineSub)
}

export const subscribeRoom = (roomId: number): () => void => {
  if (!client?.connected) return () => {}

  const msgSub = client.subscribe(
      WS_DESTINATIONS.ROOM_TOPIC(roomId),
      (frame: IMessage) => {
        try {
          const raw = JSON.parse(frame.body)
          const msg: Message = raw?.payload ?? raw
          const convId = msg.roomId ?? roomId
          useChatStore.getState().addMessage(convId, { ...msg, conversationId: convId })
          useChatStore.getState().updateConversationLastMessage(convId, { ...msg, conversationId: convId })
        } catch (e) {
          console.error('Mesaj parse hatası', e)
        }
      }
  )

  const typingSub = client.subscribe(
      WS_DESTINATIONS.TYPING_TOPIC(roomId),
      (frame: IMessage) => {
        try {
          const raw = JSON.parse(frame.body)
          const payload: TypingPayload = raw?.payload ?? raw
          const uid = payload.userId ?? payload.senderId ?? 0
          const isTyping = payload.isTyping ?? payload.typing ?? false
          useChatStore.getState().setTyping(roomId, uid, isTyping)
        } catch (e) {
          console.error('Typing parse hatası', e)
        }
      }
  )

  subscriptions.push(msgSub, typingSub)

  return () => {
    msgSub.unsubscribe()
    typingSub.unsubscribe()
  }
}

export const subscribeTyping = subscribeRoom
export const isConnected = (): boolean => client?.connected ?? false