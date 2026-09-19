package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.Notification;
import com.adaptiveaitutor.backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService =
                notificationService;
    }

    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>>
            getNotifications(
                    @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService
                        .getNotifications(userId)
        );
    }

    // Get unread notification count
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService
                        .getUnreadCount(userId)
        );
    }

    // Mark one notification as read
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Notification>
            markAsRead(
                    @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                notificationService
                        .markAsRead(notificationId)
        );
    }

    // Mark all notifications as read
    @PostMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable Long userId) {

        notificationService.markAllAsRead(
                userId
        );

        return ResponseEntity.ok().build();
    }
}