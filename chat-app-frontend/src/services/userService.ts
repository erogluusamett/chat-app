import api from './api'
import { API_ROUTES } from '@/constants'
import type { User } from '@/types'

export const userService = {
  search: (q: string) =>
      api.get<{ success: boolean; data: User[] }>(API_ROUTES.SEARCH(q))
          .then((r) => r.data.data),

  getUser: (id: number) =>
      api.get<{ success: boolean; data: User }>(API_ROUTES.USER(id))
          .then((r) => r.data.data),

  getOnlineUsers: () =>
      api.get<{ success: boolean; data: User[] }>(API_ROUTES.ONLINE_USERS)
          .then((r) => r.data.data),
}