package com.chatapp.repository;

import com.chatapp.entity.MessageReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, Long> {

    Optional<MessageReadStatus> findByMessageIdAndUserId(Long messageId, Long userId);

    boolean existsByMessageIdAndUserId(Long messageId, Long userId);

    @Query("SELECT rs FROM MessageReadStatus rs WHERE rs.message.id IN :messageIds AND rs.user.id = :userId")
    List<MessageReadStatus> findByMessageIdsAndUserId(@Param("messageIds") List<Long> messageIds,
                                                      @Param("userId") Long userId);

    List<MessageReadStatus> findByMessageId(Long messageId);
}