package com.chatapp.repository;

import com.chatapp.entity.ChatRoom;
import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT r FROM ChatRoom r JOIN r.members m WHERE m.id = :userId")
    List<ChatRoom> findRoomsByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM ChatRoom r WHERE r.roomType = 'PUBLIC'")
    List<ChatRoom> findAllPublicRooms();

    @Query("SELECT r FROM ChatRoom r WHERE r.roomType = 'DIRECT' AND " +
            "SIZE(r.members) = 2 AND " +
            "EXISTS (SELECT m FROM r.members m WHERE m.id = :user1Id) AND " +
            "EXISTS (SELECT m FROM r.members m WHERE m.id = :user2Id)")
    Optional<ChatRoom> findDirectRoom(@Param("user1Id") Long user1Id,
                                      @Param("user2Id") Long user2Id);

    @Query("SELECT r FROM ChatRoom r WHERE r.name LIKE %:query% AND r.roomType = 'PUBLIC'")
    List<ChatRoom> searchPublicRooms(@Param("query") String query);

    @Query("SELECT r FROM ChatRoom r JOIN r.members m WHERE m.id = :userId AND r.roomType != 'DIRECT'")
    List<ChatRoom> findGroupRoomsByUserId(@Param("userId") Long userId);

    boolean existsByNameAndRoomType(String name, ChatRoom.RoomType roomType);
}