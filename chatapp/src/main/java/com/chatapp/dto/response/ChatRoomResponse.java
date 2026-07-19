package com.chatapp.dto.response;

import com.chatapp.entity.ChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {

    private Long id;
    private String name;
    private String description;
    private ChatRoom.RoomType roomType;
    private UserResponse createdBy;
    private String avatarUrl;
    private boolean isPrivate;
    private int maxMembers;
    private int memberCount;
    private List<UserResponse> members;
    private MessageResponse lastMessage;
    private long unreadCount;
    private LocalDateTime createdAt;

    public static ChatRoomResponse fromChatRoom(ChatRoom room) {
        return ChatRoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .roomType(room.getRoomType())
                .createdBy(room.getCreatedBy() != null ? UserResponse.fromUser(room.getCreatedBy()) : null)
                .avatarUrl(room.getAvatarUrl())
                .isPrivate(room.isPrivate())
                .maxMembers(room.getMaxMembers())
                .memberCount(room.getMembers().size())
                .members(room.getMembers().stream()
                        .map(UserResponse::fromUser)
                        .collect(Collectors.toList()))
                .createdAt(room.getCreatedAt())
                .build();
    }
}