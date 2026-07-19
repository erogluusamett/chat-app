// ─── Kullanıcı ───────────────────────────────────────────────────────────────

export interface User {
  id: number
  username: string
  email: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  status?: 'ONLINE' | 'OFFLINE' | 'AWAY'
  lastSeenAt?: string
  createdAt?: string
}

export type Me = User

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
    tokenType: string
    user: Me
  }
}

// ─── Oda (Room = Conversation) ───────────────────────────────────────────────

export interface ChatRoom {
  id: number
  name: string
  description?: string
  type: 'DIRECT' | 'GROUP' | 'PUBLIC'
  avatarUrl?: string
  members?: User[]
  lastMessage?: Message
  unreadCount?: number
  createdAt: string
  updatedAt?: string
}

// Frontend'de Conversation olarak kullanıyoruz
export type Conversation = ChatRoom

// ─── Mesaj ───────────────────────────────────────────────────────────────────

export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'

export interface Message {
  id: number
  content: string
  sender: {
    id: number
    username: string
    displayName?: string
    avatarUrl?: string
    status?: string
  }
  senderId?: number
  roomId: number
  conversationId?: number
  messageType?: MessageType
  status?: MessageStatus
  replyToId?: number
  replyToContent?: string
  edited?: boolean
  deleted?: boolean
  createdAt: string
  updatedAt?: string
}
// ─── WebSocket ───────────────────────────────────────────────────────────────

export interface TypingPayload {
  roomId: number
  conversationId?: number
  senderId?: number
  userId?: number
  username?: string
  typing?: boolean
  isTyping?: boolean
}

export interface OnlinePayload {
  userId: number
  username?: string
  status?: string
  online?: boolean
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number
  message: string
  timestamp?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  last: boolean
}

// ─── WebSocket Mesaj ─────────────────────────────────────────────────────────

export interface SendMessagePayload {
  content: string
  roomId: number
  messageType?: MessageType
  replyToId?: number
}