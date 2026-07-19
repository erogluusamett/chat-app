import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Router koruma bileşenleri
import PrivateRoute from '@/components/router/PrivateRoute'
import PublicRoute  from '@/components/router/PublicRoute'

// Sayfalar
import LoginPage    from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ChatPage     from '@/pages/ChatPage'
import ProfilePage  from '@/pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast bildirimleri – tüm uygulama boyunca geçerli */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* ── Genel: kök yolu chat'e yönlendir ─────────────── */}
        <Route path="/" element={<Navigate to="/chat" replace />} />

        {/* ── Giriş yapılmamış kullanıcılar (PublicRoute) ───── */}
        {/*    Giriş yapılmışsa otomatik /chat'e gider          */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Giriş yapılmış kullanıcılar (PrivateRoute) ────── */}
        {/*    Giriş yapılmamışsa otomatik /login'e gider       */}
        <Route element={<PrivateRoute />}>
          <Route path="/chat"    element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* ── 404: bilinmeyen tüm path'leri /chat'e yönlendir ─ */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
