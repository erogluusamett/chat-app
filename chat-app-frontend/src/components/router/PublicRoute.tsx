import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * Oturum açılmışsa /chat'e yönlendirir (login/register sayfalarını gizler).
 * Açılmamışsa Outlet render edilir.
 */
export default function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  return <Outlet />
}
