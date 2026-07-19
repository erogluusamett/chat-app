import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { STORAGE_KEYS } from '@/constants'

// ─── Token ───────────────────────────────────────────────────────────────────

export const getToken = (): string | null =>
  localStorage.getItem(STORAGE_KEYS.TOKEN)

export const setToken = (token: string): void =>
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)

export const removeToken = (): void =>
  localStorage.removeItem(STORAGE_KEYS.TOKEN)

export const isAuthenticated = (): boolean => !!getToken()

// ─── Tarih Formatlama ────────────────────────────────────────────────────────

/**
 * Mesaj listesinde zaman damgası için kısa format:
 * Bugün  → "14:35"
 * Dün    → "Dün"
 * Diğer  → "23 Oca"
 */
export const formatMessageTime = (iso: string): string => {
  const date = new Date(iso)
  if (isToday(date))     return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Dün'
  return format(date, 'd MMM', { locale: tr })
}

/**
 * Mesaj balonu için uzun format: "23 Ocak 2025, 14:35"
 */
export const formatFullDate = (iso: string): string =>
  format(new Date(iso), 'd MMMM yyyy, HH:mm', { locale: tr })

/**
 * "3 dakika önce" gibi göreli zaman
 */
export const fromNow = (iso: string): string =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: tr })

// ─── Avatar ──────────────────────────────────────────────────────────────────

/**
 * avatarUrl yoksa kullanıcı adının ilk iki harfini döner.
 */
export const getInitials = (username: string): string =>
  username.slice(0, 2).toUpperCase()

/**
 * Kullanıcı adından deterministik bir renk döner (avatar arka planı için)
 */
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
]
export const avatarColor = (username: string): string => {
  const idx = username.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

// ─── String Yardımcıları ─────────────────────────────────────────────────────

/** "Merhaba nasılsın?" → "Merhaba nasıls..." (truncate) */
export const truncate = (str: string, maxLen = 40): string =>
  str.length > maxLen ? str.slice(0, maxLen) + '…' : str

/** Boşluk + büyük harf ile kelime ayrıştırır: "helloWorld" → "Hello World" */
export const camelToTitle = (str: string): string =>
  str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())

// ─── Sınıf Birleştirici ──────────────────────────────────────────────────────

/** Basit cn helper – clsx yerine import etmek istemeyenler için */
export const cn = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(' ')
