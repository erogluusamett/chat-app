import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.username.trim())          e.username = 'Kullanıcı adı gerekli'
    else if (form.username.length < 3)  e.username = 'En az 3 karakter olmalı'
    if (!form.email.trim())             e.email = 'E-posta gerekli'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli bir e-posta gir'
    if (!form.password)                 e.password = 'Şifre gerekli'
    else if (form.password.length < 6)  e.password = 'En az 6 karakter olmalı'
    if (form.password !== form.confirm) e.confirm = 'Şifreler eşleşmiyor'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) register({ username: form.username, email: form.email, password: form.password })
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg shadow-brand-600/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Hesap oluştur</h1>
          <p className="text-slate-400 mt-1 text-sm">ChatApp'e katıl, anında mesajlaş</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-glass">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Kullanıcı adı"
              placeholder="kullaniciadi"
              icon={<User size={16} />}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={errors.username}
              autoComplete="username"
              autoFocus
            />
            <Input
              label="E-posta"
              type="email"
              placeholder="ornek@email.com"
              icon={<Mail size={16} />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Şifre"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Şifre tekrar"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              error={errors.confirm}
              autoComplete="new-password"
            />
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
              Kayıt Ol
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
