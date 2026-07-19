export const API_BASE = ''

export const API_ROUTES = {
  LOGIN:    '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT:   '/api/auth/logout',
  ME:       '/api/users/me',

  ROOMS:       '/api/rooms/my',
  ROOM:        (id: number) => `/api/rooms/${id}`,
  DIRECT_ROOM: (targetUserId: number) => `/api/rooms/direct/${targetUserId}`,

  MESSAGES:  (roomId: number) => `/api/messages/room/${roomId}`,
  MARK_READ: (roomId: number) => `/api/messages/room/${roomId}/read`,

  USERS:        '/api/users',
  USER:         (id: number) => `/api/users/${id}`,
  SEARCH:       (q: string) => `/api/users/search?q=${encodeURIComponent(q)}`,
  ONLINE_USERS: '/api/users/online',
} as const

export const WS_DESTINATIONS = {
  SEND_MESSAGE: '/app/chat.sendMessage',
  TYPING:       '/app/chat.typing',
  READ:         '/app/chat.messageRead',

  ROOM_TOPIC:   (roomId: number) => `/topic/room.${roomId}`,
  TYPING_TOPIC: (roomId: number) => `/topic/room.${roomId}.typing`,
  ONLINE_TOPIC: '/topic/users.status',
} as const

export const STORAGE_KEYS = {
  TOKEN: 'chat_auth',
  USER:  'chat_auth',
} as const

export const PAGE_SIZE = 50