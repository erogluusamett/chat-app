import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authService } from '@/services/authService'
import { disconnectSocket } from '@/services/socketService'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest, RegisterRequest } from '@/types'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth, logout: storeLogout } = useAuthStore()

  const login = async (data: LoginRequest) => {
    setLoading(true)
    try {
      const res = await authService.login(data)
      setAuth(res.token, res.user)
      toast.success(`Hoş geldin, ${res.user.username}!`)
      navigate('/chat')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Giriş başarısız'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setLoading(true)
    try {
      const res = await authService.register(data)
      setAuth(res.token, res.user)
      toast.success('Hesap oluşturuldu!')
      navigate('/chat')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Kayıt başarısız'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await authService.logout()
    disconnectSocket()
    storeLogout()
    navigate('/login')
  }

  return { login, register, logout, loading }
}
