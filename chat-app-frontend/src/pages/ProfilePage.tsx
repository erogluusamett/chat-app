import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, User, Mail, Camera } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const { logout } = useAuth()

  const [form, setForm] = useState({
    username: user?.username ?? '',
    email:    user?.email ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      // Backend profil güncelleme endpoint'i eklendiğinde:
      // await userService.updateProfile(form)
      setUser({ ...user, ...form })
      toast.success('Profil güncellendi')
    } catch {
      toast.error('Güncelleme başarısız')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Sohbete dön
        </button>

        <div className="glass rounded-2xl p-8 shadow-glass">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative group cursor-pointer">
              <Avatar username={user.username} avatarUrl={user.avatarUrl} size="lg" />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">{user.username}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              {user.createdAt && (
                <p className="text-xs text-slate-700 mt-0.5">
                  Üyelik: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <Input
              label="Kullanıcı adı"
              icon={<User size={16} />}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              label="E-posta"
              type="email"
              icon={<Mail size={16} />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Button type="submit" fullWidth loading={saving}>
              Değişiklikleri Kaydet
            </Button>
          </form>

          {/* Çıkış */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <Button variant="danger" fullWidth icon={<LogOut size={16} />} onClick={logout}>
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
