import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Me } from '@/types'

interface AuthState {
    token: string | null
    user: Me | null
    isAuthenticated: boolean
    setAuth: (token: string, user: Me) => void
    setUser: (user: Me) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            setAuth: (token, user) =>
                set({ token, user, isAuthenticated: true }),

            setUser: (user) =>
                set({ user }),

            logout: () =>
                set({ token: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'chat_auth',  // localStorage key
        }
    )
)