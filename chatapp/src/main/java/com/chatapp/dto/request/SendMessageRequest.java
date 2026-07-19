package com.chatapp.dto.request;

import com.chatapp.entity.Message;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendMessageRequest {

    private String content;

    @NotNull
    private Long roomId;

    private Message.MessageType messageType = Message.MessageType.TEXT;

    private Long replyToId;
}