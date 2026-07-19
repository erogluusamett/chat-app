import api from './api'
import { API_ROUTES } from '@/constants'
import type { AuthResponse, LoginRequest, Me, RegisterRequest } from '@/types'

export const authService = {
  login: async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>(API_ROUTES.LOGIN, data)
    return {
      token: res.data.data.accessToken,
      user: res.data.data.user,
    }
  },

  register: async (data: RegisterRequest) => {
    const res = await api.post<AuthResponse>(API_ROUTES.REGISTER, data)
    return {
      token: res.data.data.accessToken,
      user: res.data.data.user,
    }
  },

  me: () =>
      api.get<Me>(API_ROUTES.ME).then((r) => r.data),

  logout: () =>
      api.post(API_ROUTES.LOGOUT).catch(() => {}),
}