package com.chatapp.service;

import com.chatapp.dto.request.CreateRoomRequest;
import com.chatapp.dto.response.ChatRoomResponse;
import com.chatapp.dto.response.MessageResponse;
import com.chatapp.entity.ChatRoom;
import com.chatapp.entity.Message;
import com.chatapp.entity.User;
import com.chatapp.exception.BadRequestException;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.exception.UnauthorizedException;
import com.chatapp.repository.ChatRoomRepository;
import com.chatapp.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;

    @Transactional
    public ChatRoomResponse createRoom(String username, CreateRoomRequest request) {
        User creator = userService.getUserEntityByUsername(username);

        ChatRoom room = ChatRoom.builder()
                .name(request.getName())
                .description(request.getDescription())
                .roomType(request.getRoomType())
                .createdBy(creator)
                .isPrivate(request.isPrivate())
                .maxMembers(request.getMaxMembers() > 0 ? request.getMaxMembers() : 100)
                .build();

        room.getMembers().add(creator);
        room = chatRoomRepository.save(room);

        log.info("Yeni oda oluşturuldu: {} - {}", room.getName(), username);
        return ChatRoomResponse.fromChatRoom(room);
    }

    @Transactional
    public ChatRoomResponse createOrGetDirectRoom(String username, Long targetUserId) {
        User currentUser = userService.getUserEntityByUsername(username);
        User targetUser = userService.getUserEntityByUsername(
                userService.getUserById(targetUserId).getUsername()
        );

        // Mevcut DM odasını kontrol et
        return chatRoomRepository.findDirectRoom(currentUser.getId(), targetUserId)
                .map(ChatRoomResponse::fromChatRoom)
                .orElseGet(() -> {
                    ChatRoom dm = ChatRoom.builder()
                            .name(currentUser.getUsername() + " & " + targetUser.getUsername())
                            .roomType(ChatRoom.RoomType.DIRECT)
                            .isPrivate(true)
                            .maxMembers(2)
                            .build();

                    dm.getMembers().add(currentUser);
                    dm.getMembers().add(targetUser);
                    dm = chatRoomRepository.save(dm);
                    log.info("DM odası oluşturuldu: {} <-> {}", username, targetUser.getUsername());
                    return ChatRoomResponse.fromChatRoom(dm);
                });
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getUserRooms(String username) {
        User user = userService.getUserEntityByUsername(username);
        List<ChatRoom> rooms = chatRoomRepository.findRoomsByUserId(user.getId());

        return rooms.stream()
                .map(room -> {
                    ChatRoomResponse response = ChatRoomResponse.fromChatRoom(room);

                    // Son mesajı getir
                    List<Message> lastMessages = messageRepository
                            .findLastMessagesByRoomId(room.getId(), PageRequest.of(0, 1));
                    if (!lastMessages.isEmpty()) {
                        response.setLastMessage(MessageResponse.fromMessage(lastMessages.get(0)));
                    }

                    // Okunmamış mesaj sayısı
                    long unreadCount = messageRepository.countUnreadMessages(room.getId(), user.getId());
                    response.setUnreadCount(unreadCount);

                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getPublicRooms() {
        return chatRoomRepository.findAllPublicRooms()
                .stream()
                .map(ChatRoomResponse::fromChatRoom)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatRoomResponse getRoomById(Long roomId, String username) {
        User user = userService.getUserEntityByUsername(username);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Oda bulunamadı: " + roomId));

        if (room.isPrivate() && !room.getMembers().contains(user)) {
            throw new UnauthorizedException("Bu odaya erişim yetkiniz yok");
        }

        return ChatRoomResponse.fromChatRoom(room);
    }

    @Transactional
    public ChatRoomResponse joinRoom(Long roomId, String username) {
        User user = userService.getUserEntityByUsername(username);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Oda bulunamadı: " + roomId));

        if (room.isPrivate()) {
            throw new BadRequestException("Bu oda gizli, davet olmadan katılamazsınız");
        }

        if (room.getMembers().size() >= room.getMaxMembers()) {
            throw new BadRequestException("Oda dolu, katılamazsınız");
        }

        if (!room.getMembers().contains(user)) {
            room.getMembers().add(user);
            chatRoomRepository.save(room);
            log.info("{} kullanıcısı {} odasına katıldı", username, room.getName());
        }

        return ChatRoomResponse.fromChatRoom(room);
    }

    @Transactional
    public void leaveRoom(Long roomId, String username) {
        User user = userService.getUserEntityByUsername(username);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Oda bulunamadı: " + roomId));

        if (room.getRoomType() == ChatRoom.RoomType.DIRECT) {
            throw new BadRequestException("Direkt mesaj odasından çıkamazsınız");
        }

        room.getMembers().remove(user);
        chatRoomRepository.save(room);
        log.info("{} kullanıcısı {} odasından ayrıldı", username, room.getName());
    }

    @Transactional
    public ChatRoomResponse addMember(Long roomId, Long userId, String requestingUsername) {
        User requester = userService.getUserEntityByUsername(requestingUsername);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Oda bulunamadı: " + roomId));

        if (!room.getCreatedBy().getId().equals(requester.getId())) {
            throw new UnauthorizedException("Sadece oda sahibi üye ekleyebilir");
        }

        User newMember = userService.getUserEntityByUsername(
                userService.getUserById(userId).getUsername()
        );

        if (!room.getMembers().contains(newMember)) {
            room.getMembers().add(newMember);
            chatRoomRepository.save(room);
        }

        return ChatRoomResponse.fromChatRoom(room);
    }

    public List<ChatRoomResponse> searchRooms(String query) {
        return chatRoomRepository.searchPublicRooms(query)
                .stream()
                .map(ChatRoomResponse::fromChatRoom)
                .collect(Collectors.toList());
    }

    public ChatRoom getRoomEntity(Long roomId) {
        return chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Oda bulunamadı: " + roomId));
    }
}