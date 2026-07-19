import { create } from 'zustand'
import type { Conversation, Message } from '@/types'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: number | null
  messages: Record<number, Message[]>   // conversationId → mesajlar
  typingUsers: Record<number, number[]> // conversationId → userId listesi

  // Conversation actions
  setConversations: (convs: Conversation[]) => void
  addConversation: (conv: Conversation) => void
  updateConversationLastMessage: (conversationId: number, msg: Message) => void
  setActiveConversation: (id: number | null) => void

  // Message actions
  setMessages: (conversationId: number, msgs: Message[]) => void
  prependMessages: (conversationId: number, msgs: Message[]) => void  // eski mesajlar için
  addMessage: (conversationId: number, msg: Message) => void
  updateMessage: (conversationId: number, msgId: number, patch: Partial<Message>) => void

  // Typing actions
  setTyping: (conversationId: number, userId: number, typing: boolean) => void

  // Getter
  getActiveMessages: () => Message[]
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},

  // ─── Conversation ──────────────────────────────────────────────

  setConversations: (convs) => set({ conversations: convs }),

  addConversation: (conv) =>
    set((s) => ({
      conversations: s.conversations.some((c) => c.id === conv.id)
        ? s.conversations
        : [conv, ...s.conversations],
    })),

  updateConversationLastMessage: (conversationId, msg) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
          : c
      ),
    })),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  // ─── Messages ─────────────────────────────────────────────────

  setMessages: (conversationId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [conversationId]: msgs } })),

  prependMessages: (conversationId, msgs) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...msgs, ...(s.messages[conversationId] ?? [])],
      },
    })),

  addMessage: (conversationId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] ?? []), msg],
      },
    })),

  updateMessage: (conversationId, msgId, patch) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === msgId ? { ...m, ...patch } : m
        ),
      },
    })),

  // ─── Typing ───────────────────────────────────────────────────

  setTyping: (conversationId, userId, typing) =>
    set((s) => {
      const current = s.typingUsers[conversationId] ?? []
      const updated = typing
        ? current.includes(userId) ? current : [...current, userId]
        : current.filter((id) => id !== userId)
      return { typingUsers: { ...s.typingUsers, [conversationId]: updated } }
    }),

  // ─── Getters ──────────────────────────────────────────────────

  getActiveMessages: () => {
    const { activeConversationId, messages } = get()
    if (!activeConversationId) return []
    return messages[activeConversationId] ?? []
  },
}))
