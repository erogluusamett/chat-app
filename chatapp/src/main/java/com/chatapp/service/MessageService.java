package com.chatapp.service;

import com.chatapp.dto.request.SendMessageRequest;
import com.chatapp.dto.response.MessageResponse;
import com.chatapp.entity.*;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.exception.UnauthorizedException;
import com.chatapp.repository.MessageReadStatusRepository;
import com.chatapp.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final MessageReadStatusRepository readStatusRepository;
    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final FileStorageService fileStorageService;

    @Transactional
    public MessageResponse sendMessage(String username, SendMessageRequest request) {
        User sender = userService.getUserEntityByUsername(username);
        ChatRoom room = chatRoomService.getRoomEntity(request.getRoomId());

        // Kullanıcının odaya üye olup olmadığını kontrol et
        if (!room.getMembers().contains(sender)) {
            throw new UnauthorizedException("Bu odada mesaj gönderme yetkiniz yok");
        }

        Message.MessageBuilder messageBuilder = Message.builder()
                .content(request.getContent())
                .messageType(request.getMessageType() != null ?
                        request.getMessageType() : Message.MessageType.TEXT)
                .sender(sender)
                .chatRoom(room);

        // Yanıt mesajı
        if (request.getReplyToId() != null) {
            Message replyTo = messageRepository.findById(request.getReplyToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Yanıtlanacak mesaj bulunamadı"));
            messageBuilder.replyTo(replyTo);
        }

        Message message = messageRepository.save(messageBuilder.build());

        // Göndereni okundu olarak işaretle
        markAsRead(message, sender);

        log.debug("Mesaj gönderildi - Oda: {}, Kullanıcı: {}", room.getId(), username);
        return buildMessageResponse(message, sender.getId());
    }

    @Transactional
    public MessageResponse sendFileMessage(String username, Long roomId, MultipartFile file) {
        User sender = userService.getUserEntityByUsername(username);
        ChatRoom room = chatRoomService.getRoomEntity(roomId);

        if (!room.getMembers().contains(sender)) {
            throw new UnauthorizedException("Bu odada dosya gönderme yetkiniz yok");
        }

        String fileUrl = fileStorageService.storeFile(file, "messages");
        String contentType = file.getContentType();
        Message.MessageType messageType = (contentType != null && contentType.startsWith("image/")) ?
                Message.MessageType.IMAGE : Message.MessageType.FILE;

        Message message = Message.builder()
                .messageType(messageType)
                .sender(sender)
                .chatRoom(room)
                .fileUrl(fileUrl)
                .fileName(file.getOriginalFilename())
                .fileType(contentType)
                .fileSize(file.getSize())
                .content(file.getOriginalFilename())
                .build();

        message = messageRepository.save(message);
        markAsRead(message, sender);

        return buildMessageResponse(message, sender.getId());
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> getRoomMessages(Long roomId, String username, int page, int size) {
        User user = userService.getUserEntityByUsername(username);
        ChatRoom room = chatRoomService.getRoomEntity(roomId);

        if (room.isPrivate() && !room.getMembers().contains(user)) {
            throw new UnauthorizedException("Bu odanın mesajlarına erişim yetkiniz yok");
        }

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return messageRepository.findMessagesByRoomId(roomId, pageRequest)
                .map(msg -> buildMessageResponse(msg, user.getId()));
    }

    @Transactional
    public void markMessagesAsRead(Long roomId, String username) {
        User user = userService.getUserEntityByUsername(username);
        List<Message> unreadMessages = messageRepository.findUnreadMessages(roomId, user.getId());

        unreadMessages.forEach(message -> markAsRead(message, user));
        log.debug("{} mesaj okundu - Oda: {}, Kullanıcı: {}", unreadMessages.size(), roomId, username);
    }

    @Transactional
    public MessageResponse markSingleMessageAsRead(Long messageId, String username) {
        User user = userService.getUserEntityByUsername(username);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesaj bulunamadı: " + messageId));

        markAsRead(message, user);
        return buildMessageResponse(message, user.getId());
    }

    @Transactional
    public MessageResponse deleteMessage(Long messageId, String username) {
        User user = userService.getUserEntityByUsername(username);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesaj bulunamadı: " + messageId));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new UnauthorizedException("Sadece kendi mesajınızı silebilirsiniz");
        }

        message.setDeleted(true);
        message.setContent("[Bu mesaj silindi]");
        message = messageRepository.save(message);

        return buildMessageResponse(message, user.getId());
    }

    @Transactional
    public MessageResponse editMessage(Long messageId, String content, String username) {
        User user = userService.getUserEntityByUsername(username);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesaj bulunamadı: " + messageId));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new UnauthorizedException("Sadece kendi mesajınızı düzenleyebilirsiniz");
        }

        message.setContent(content);
        message.setEdited(true);
        message = messageRepository.save(message);

        return buildMessageResponse(message, user.getId());
    }

    private void markAsRead(Message message, User user) {
        if (!readStatusRepository.existsByMessageIdAndUserId(message.getId(), user.getId())) {
            MessageReadStatus readStatus = MessageReadStatus.builder()
                    .message(message)
                    .user(user)
                    .build();
            readStatusRepository.save(readStatus);
        }
    }

    private MessageResponse buildMessageResponse(Message message, Long currentUserId) {
        MessageResponse response = MessageResponse.fromMessage(message);

        List<MessageResponse.ReadStatusResponse> readStatuses = readStatusRepository
                .findByMessageId(message.getId())
                .stream()
                .map(rs -> MessageResponse.ReadStatusResponse.builder()
                        .userId(rs.getUser().getId())
                        .username(rs.getUser().getUsername())
                        .readAt(rs.getReadAt())
                        .build())
                .collect(Collectors.toList());

        response.setReadStatuses(readStatuses);
        return response;
    }
}