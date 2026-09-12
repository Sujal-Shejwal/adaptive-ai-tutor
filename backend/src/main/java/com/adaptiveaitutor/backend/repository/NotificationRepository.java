package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // =====================================================
    // GET ALL NOTIFICATIONS FOR USER
    // =====================================================

    List<Notification> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    // =====================================================
    // GET UNREAD NOTIFICATIONS
    // =====================================================

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(
            Long userId
    );

    // =====================================================
    // COUNT UNREAD NOTIFICATIONS
    // =====================================================

    long countByUserIdAndReadFalse(
            Long userId
    );

    // =====================================================
    // DELETE USER NOTIFICATIONS
    // =====================================================

    void deleteByUserId(
            Long userId
    );
}