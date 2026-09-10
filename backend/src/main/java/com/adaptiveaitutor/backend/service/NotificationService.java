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

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Create notification for a user
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

        Notification notification =
                new Notification(
                        user,
                        type,
                        title,
                        message
                );

        return notificationRepository.save(
                notification
        );
    }

    // Get all notifications for a user
    @Transactional(readOnly = true)
    public List<Notification> getNotifications(
            Long userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );
    }

    // Get unread notification count
    @Transactional(readOnly = true)
    public long getUnreadCount(
            Long userId) {

        return notificationRepository
                .countByUserIdAndIsReadFalse(
                        userId
                );
    }

    // Mark one notification as read
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

        notification.setIsRead(true);

        return notificationRepository.save(
                notification
        );
    }

    // Mark all user notifications as read
    public void markAllAsRead(
            Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndIsReadFalse(
                                userId
                        );

        for (Notification notification :
                notifications) {

            notification.setIsRead(true);
        }

        notificationRepository.saveAll(
                notifications
        );
    }
}