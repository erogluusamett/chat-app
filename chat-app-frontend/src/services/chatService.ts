import api from './api'
import { API_ROUTES, PAGE_SIZE } from '@/constants'
import type { Conversation, Message, PageResponse } from '@/types'

export const chatService = {
    getConversations: () =>
        api.get<{ success: boolean; data: Conversation[] }>(API_ROUTES.ROOMS)
            .then((r) => r.data.data),

    getConversation: (id: number) =>
        api.get<{ success: boolean; data: Conversation }>(API_ROUTES.ROOM(id))
            .then((r) => r.data.data),

    startConversation: (targetUserId: number) =>
        api.post<{ success: boolean; data: Conversation }>(API_ROUTES.DIRECT_ROOM(targetUserId))
            .then((r) => r.data.data),

    getMessages: (roomId: number, page = 0) =>
        api.get<{ success: boolean; data: PageResponse<Message> }>(API_ROUTES.MESSAGES(roomId), {
            params: { page, size: PAGE_SIZE },
        }).then((r) => r.data.data),
}