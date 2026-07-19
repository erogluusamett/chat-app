import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * Oturum açılmamışsa /login'e yönlendirir.
 * Açılmışsa Outlet (alt route) render edilir.
 *
 * Kullanım (App.tsx):
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/chat" element={<ChatPage />} />
 *     <Route path="/profile" element={<ProfilePage />} />
 *   </Route>
 */
export default function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // Kullanıcı giriş yaptıktan sonra geri dönmesi için `state` ile mevcut path saklanır
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
