package com.chatapp.repository;

import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.status = 'ONLINE'")
    List<User> findAllOnlineUsers();

    @Query("SELECT u FROM User u WHERE u.username LIKE %:query% OR u.displayName LIKE %:query%")
    List<User> searchUsers(@Param("query") String query);

    @Modifying
    @Query("UPDATE User u SET u.status = :status, u.lastSeenAt = :lastSeen WHERE u.id = :userId")
    void updateUserStatus(@Param("userId") Long userId,
                          @Param("status") User.UserStatus status,
                          @Param("lastSeen") LocalDateTime lastSeen);

    @Query("SELECT u FROM User u JOIN u.rooms r WHERE r.id = :roomId")
    List<User> findUsersByRoomId(@Param("roomId") Long roomId);
}