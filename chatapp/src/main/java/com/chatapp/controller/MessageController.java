package com.chatapp.controller;

import com.chatapp.dto.request.SendMessageRequest;
import com.chatapp.dto.response.ApiResponse;
import com.chatapp.dto.response.MessageResponse;
import com.chatapp.dto.response.WebSocketMessage;
import com.chatapp.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            Principal principal) {
        MessageResponse message = messageService.sendMessage(principal.getName(), request);

        // WebSocket üzerinden de bildir
        broadcastMessage(message, WebSocketMessage.TYPE_MESSAGE);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message));
    }

    @PostMapping("/file")
    public ResponseEntity<ApiResponse<MessageResponse>> sendFileMessage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("roomId") Long roomId,
            Principal principal) {
        MessageResponse message = messageService.sendFileMessage(principal.getName(), roomId, file);

        broadcastMessage(message, WebSocketMessage.TYPE_MESSAGE);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dosya gönderildi", message));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getRoomMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Principal principal) {
        Page<MessageResponse> messages = messageService.getRoomMessages(
                roomId, principal.getName(), page, size
        );
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/room/{roomId}/read")
    public ResponseEntity<ApiResponse<Void>> markRoomMessagesAsRead(
            @PathVariable Long roomId,
            Principal principal) {
        messageService.markMessagesAsRead(roomId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Mesajlar okundu olarak işaretlendi", null));
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String content = body.get("content");
        MessageResponse updated = messageService.editMessage(messageId, content, principal.getName());

        broadcastMessage(updated, WebSocketMessage.TYPE_MESSAGE_EDITED);

        return ResponseEntity.ok(ApiResponse.success("Mesaj güncellendi", updated));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteMessage(
            @PathVariable Long messageId,
            Principal principal) {
        MessageResponse deleted = messageService.deleteMessage(messageId, principal.getName());

        broadcastMessage(deleted, WebSocketMessage.TYPE_MESSAGE_DELETED);

        return ResponseEntity.ok(ApiResponse.success("Mesaj silindi", deleted));
    }

    private void broadcastMessage(MessageResponse message, String type) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type(type)
                .payload(message)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/room." + message.getRoomId(),
                wsMessage
        );
    }
}