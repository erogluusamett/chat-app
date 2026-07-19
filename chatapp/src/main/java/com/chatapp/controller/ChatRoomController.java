package com.chatapp.controller;

import com.chatapp.dto.request.CreateRoomRequest;
import com.chatapp.dto.response.ApiResponse;
import com.chatapp.dto.response.ChatRoomResponse;
import com.chatapp.service.ChatRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatRoomResponse>> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            Principal principal) {
        ChatRoomResponse room = chatRoomService.createRoom(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Oda oluşturuldu", room));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getMyRooms(Principal principal) {
        List<ChatRoomResponse> rooms = chatRoomService.getUserRooms(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getPublicRooms() {
        List<ChatRoomResponse> rooms = chatRoomService.getPublicRooms();
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> searchRooms(
            @RequestParam String q) {
        List<ChatRoomResponse> rooms = chatRoomService.searchRooms(q);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> getRoomById(
            @PathVariable Long roomId,
            Principal principal) {
        ChatRoomResponse room = chatRoomService.getRoomById(roomId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    @PostMapping("/direct/{targetUserId}")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> createDirectRoom(
            @PathVariable Long targetUserId,
            Principal principal) {
        ChatRoomResponse room = chatRoomService.createOrGetDirectRoom(
                principal.getName(), targetUserId
        );
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> joinRoom(
            @PathVariable Long roomId,
            Principal principal) {
        ChatRoomResponse room = chatRoomService.joinRoom(roomId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Odaya katıldınız", room));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveRoom(
            @PathVariable Long roomId,
            Principal principal) {
        chatRoomService.leaveRoom(roomId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Odadan ayrıldınız", null));
    }

    @PostMapping("/{roomId}/members")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> addMember(
            @PathVariable Long roomId,
            @RequestBody Map<String, Long> body,
            Principal principal) {
        Long userId = body.get("userId");
        ChatRoomResponse room = chatRoomService.addMember(roomId, userId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Üye eklendi", room));
    }
}