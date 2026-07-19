package com.chatapp.dto.request;

import com.chatapp.entity.ChatRoom;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRoomRequest {

    @NotBlank(message = "Oda adı boş olamaz")
    @Size(min = 2, max = 100, message = "Oda adı 2-100 karakter arasında olmalı")
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull(message = "Oda tipi belirtilmeli")
    private ChatRoom.RoomType roomType;

    private boolean isPrivate = false;

    private int maxMembers = 100;
}