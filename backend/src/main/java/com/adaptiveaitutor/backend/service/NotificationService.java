package com.adaptiveaitutor.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.Notification;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.NotificationRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository =
                notificationRepository;

        this.userRepository =
                userRepository;
    }

    // =====================================================
    // CREATE NOTIFICATION
    // =====================================================

    public Notification createNotification(
            Long userId,
            String type,
            String title,
            String message) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        /*
         * Notification constructor order:
         *
         * user
         * title
         * message
         * type
         */
        Notification notification =
                new Notification(
                        user,
                        title,
                        message,
                        type
                );

        return notificationRepository.save(
                notification
        );
    }

    // =====================================================
    // GET ALL NOTIFICATIONS FOR USER
    // =====================================================

    @Transactional(readOnly = true)
    public List<Notification> getNotifications(
            Long userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );
    }

    // =====================================================
    // GET UNREAD NOTIFICATION COUNT
    // =====================================================

    @Transactional(readOnly = true)
    public long getUnreadCount(
            Long userId) {

        return notificationRepository
                .countByUserIdAndReadFalse(
                        userId
                );
    }

    // =====================================================
    // MARK ONE NOTIFICATION AS READ
    // =====================================================

    public Notification markAsRead(
            Long notificationId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        notification.setRead(true);

        return notificationRepository.save(
                notification
        );
    }

    // =====================================================
    // MARK ALL USER NOTIFICATIONS AS READ
    // =====================================================

    public void markAllAsRead(
            Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                userId
                        );

        for (Notification notification :
                notifications) {

            notification.setRead(true);
        }

        notificationRepository.saveAll(
                notifications
        );
    }
}