package com.chatapp.dto.response;

import com.chatapp.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {

    private String type;
    private Object payload;

    // Mesaj tipleri
    public static final String TYPE_MESSAGE = "MESSAGE";
    public static final String TYPE_MESSAGE_READ = "MESSAGE_READ";
    public static final String TYPE_USER_JOINED = "USER_JOINED";
    public static final String TYPE_USER_LEFT = "USER_LEFT";
    public static final String TYPE_USER_TYPING = "USER_TYPING";
    public static final String TYPE_USER_STOP_TYPING = "USER_STOP_TYPING";
    public static final String TYPE_USER_STATUS = "USER_STATUS";
    public static final String TYPE_MESSAGE_DELETED = "MESSAGE_DELETED";
    public static final String TYPE_MESSAGE_EDITED = "MESSAGE_EDITED";

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypingPayload {
        private Long roomId;
        private Long userId;
        private String username;
        private boolean isTyping;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatusPayload {
        private Long userId;
        private String username;
        private String status;
        private LocalDateTime lastSeenAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadReceiptPayload {
        private Long messageId;
        private Long roomId;
        private Long userId;
        private String username;
        private LocalDateTime readAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessagePayload {
        private String content;
        private Long roomId;
        private Message.MessageType messageType;
        private Long replyToId;
    }
}