package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // Get user's latest notifications first
    List<Notification> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    // Count unread notifications
    long countByUserIdAndIsReadFalse(
            Long userId
    );

    // Mark all notifications as read
    List<Notification> findByUserIdAndIsReadFalse(
            Long userId
    );
}