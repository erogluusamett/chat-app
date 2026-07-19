package com.chatapp.repository;

import com.chatapp.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.chatRoom.id = :roomId AND m.isDeleted = false ORDER BY m.createdAt ASC")
    Page<Message> findMessagesByRoomId(@Param("roomId") Long roomId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.chatRoom.id = :roomId AND m.isDeleted = false ORDER BY m.createdAt DESC")
    List<Message> findLastMessagesByRoomId(@Param("roomId") Long roomId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m " +
            "LEFT JOIN m.readStatuses rs ON rs.user.id = :userId " +
            "WHERE m.chatRoom.id = :roomId AND m.sender.id != :userId AND rs.id IS NULL AND m.isDeleted = false")
    long countUnreadMessages(@Param("roomId") Long roomId, @Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.chatRoom.id = :roomId AND " +
            "m.sender.id != :userId AND m.isDeleted = false AND " +
            "m.id NOT IN (SELECT rs.message.id FROM MessageReadStatus rs WHERE rs.user.id = :userId)")
    List<Message> findUnreadMessages(@Param("roomId") Long roomId, @Param("userId") Long userId);
}