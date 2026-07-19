package com.chatapp.dto.response;

import com.chatapp.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private Long id;
    private String content;
    private Message.MessageType messageType;
    private UserResponse sender;
    private Long roomId;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Long replyToId;
    private String replyToContent;
    private boolean isEdited;
    private boolean isDeleted;
    private List<ReadStatusResponse> readStatuses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MessageResponse fromMessage(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .content(message.isDeleted() ? "[Bu mesaj silindi]" : message.getContent())
                .messageType(message.getMessageType())
                .sender(UserResponse.fromUser(message.getSender()))
                .roomId(message.getChatRoom().getId())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileType(message.getFileType())
                .fileSize(message.getFileSize())
                .replyToId(message.getReplyTo() != null ? message.getReplyTo().getId() : null)
                .replyToContent(message.getReplyTo() != null ? message.getReplyTo().getContent() : null)
                .isEdited(message.isEdited())
                .isDeleted(message.isDeleted())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadStatusResponse {
        private Long userId;
        private String username;
        private LocalDateTime readAt;
    }
}