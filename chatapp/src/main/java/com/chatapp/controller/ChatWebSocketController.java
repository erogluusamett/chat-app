package com.chatapp.websocket;

import com.chatapp.dto.response.MessageResponse;
import com.chatapp.dto.response.WebSocketMessage;
import com.chatapp.entity.User;
import com.chatapp.service.MessageService;
import com.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserService userService;

    /**
     * Odaya mesaj gönder: /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload WebSocketMessage.ChatMessagePayload payload,
                            SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) {
            log.warn("Kimlik doğrulanmamış WebSocket mesajı");
            return;
        }

        String username = principal.getName();

        com.chatapp.dto.request.SendMessageRequest request =
                new com.chatapp.dto.request.SendMessageRequest();
        request.setContent(payload.getContent());
        request.setRoomId(payload.getRoomId());
        request.setMessageType(payload.getMessageType());
        request.setReplyToId(payload.getReplyToId());

        try {
            MessageResponse messageResponse = messageService.sendMessage(username, request);

            WebSocketMessage wsMessage = WebSocketMessage.builder()
                    .type(WebSocketMessage.TYPE_MESSAGE)
                    .payload(messageResponse)
                    .build();

            // Odadaki herkese gönder
            messagingTemplate.convertAndSend(
                    "/topic/room." + payload.getRoomId(),
                    wsMessage
            );

            log.debug("WS Mesaj gönderildi - Oda: {}", payload.getRoomId());

        } catch (Exception e) {
            log.error("WS Mesaj gönderme hatası: {}", e.getMessage());
        }
    }

    /**
     * Yazıyor bildirimi: /app/chat.typing
     */
    @MessageMapping("/chat.typing")
    public void userTyping(@Payload WebSocketMessage.TypingPayload payload,
                           SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) return;

        String username = principal.getName();

        try {
            User user = userService.getUserEntityByUsername(username);

            WebSocketMessage.TypingPayload typingPayload = WebSocketMessage.TypingPayload.builder()
                    .roomId(payload.getRoomId())
                    .userId(user.getId())
                    .username(username)
                    .isTyping(payload.isTyping())
                    .build();

            WebSocketMessage wsMessage = WebSocketMessage.builder()
                    .type(payload.isTyping() ?
                            WebSocketMessage.TYPE_USER_TYPING :
                            WebSocketMessage.TYPE_USER_STOP_TYPING)
                    .payload(typingPayload)
                    .build();

            // Yazıyor bildirimini odaya gönder (kendisi hariç)
            messagingTemplate.convertAndSend(
                    "/topic/room." + payload.getRoomId() + ".typing",
                    wsMessage
            );

        } catch (Exception e) {
            log.error("Yazıyor bildirimi hatası: {}", e.getMessage());
        }
    }

    /**
     * Mesaj okundu bildirimi: /app/chat.messageRead
     */
    @MessageMapping("/chat.messageRead")
    public void messageRead(@Payload WebSocketMessage.ReadReceiptPayload payload,
                            SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) return;

        String username = principal.getName();

        try {
            MessageResponse updatedMessage = messageService.markSingleMessageAsRead(
                    payload.getMessageId(), username
            );

            User user = userService.getUserEntityByUsername(username);

            WebSocketMessage.ReadReceiptPayload readPayload = WebSocketMessage.ReadReceiptPayload.builder()
                    .messageId(payload.getMessageId())
                    .roomId(payload.getRoomId())
                    .userId(user.getId())
                    .username(username)
                    .readAt(LocalDateTime.now())
                    .build();

            WebSocketMessage wsMessage = WebSocketMessage.builder()
                    .type(WebSocketMessage.TYPE_MESSAGE_READ)
                    .payload(readPayload)
                    .build();

            messagingTemplate.convertAndSend(
                    "/topic/room." + payload.getRoomId(),
                    wsMessage
            );

        } catch (Exception e) {
            log.error("Mesaj okundu bildirimi hatası: {}", e.getMessage());
        }
    }

    /**
     * WebSocket bağlantı açıldığında
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();

        if (principal != null) {
            String username = principal.getName();
            log.info("Yeni WebSocket bağlantısı: {}", username);

            try {
                userService.updateUserStatus(username, User.UserStatus.ONLINE);
                broadcastUserStatus(username, "ONLINE");
            } catch (Exception e) {
                log.error("Kullanıcı durumu güncellenemedi: {}", e.getMessage());
            }
        }
    }

    /**
     * WebSocket bağlantı kapandığında
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();

        if (principal != null) {
            String username = principal.getName();
            log.info("WebSocket bağlantısı kapandı: {}", username);

            try {
                userService.updateUserStatus(username, User.UserStatus.OFFLINE);
                broadcastUserStatus(username, "OFFLINE");
            } catch (Exception e) {
                log.error("Kullanıcı durumu güncellenemedi: {}", e.getMessage());
            }
        }
    }

    private void broadcastUserStatus(String username, String status) {
        try {
            User user = userService.getUserEntityByUsername(username);

            WebSocketMessage.UserStatusPayload statusPayload = WebSocketMessage.UserStatusPayload.builder()
                    .userId(user.getId())
                    .username(username)
                    .status(status)
                    .lastSeenAt(LocalDateTime.now())
                    .build();

            WebSocketMessage wsMessage = WebSocketMessage.builder()
                    .type(WebSocketMessage.TYPE_USER_STATUS)
                    .payload(statusPayload)
                    .build();

            // Tüm online kullanıcılara bildir
            messagingTemplate.convertAndSend("/topic/users.status", wsMessage);

        } catch (Exception e) {
            log.error("Kullanıcı durumu yayınlanamadı: {}", e.getMessage());
        }
    }
}