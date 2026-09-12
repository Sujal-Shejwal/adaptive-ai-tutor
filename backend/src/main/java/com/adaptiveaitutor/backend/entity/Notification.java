package com.adaptiveaitutor.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // STUDENT / USER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // =====================================================
    // NOTIFICATION TITLE
    // =====================================================

    @Column(nullable = false)
    private String title;

    // =====================================================
    // NOTIFICATION MESSAGE
    // =====================================================

    @Column(nullable = false, length = 1000)
    private String message;

    // =====================================================
    // NOTIFICATION TYPE
    // =====================================================
    //
    // Examples:
    //
    // QUIZ
    // CONTENT
    // ANNOUNCEMENT
    // REMINDER
    // =====================================================

    @Column(nullable = false)
    private String type;

    // =====================================================
    // READ STATUS
    // =====================================================

    @Column(
            name = "is_read",
            nullable = false
    )
    private Boolean read = false;

    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    // =====================================================
    // OPTIONAL REFERENCE TYPE
    // =====================================================
    //
    // Used to identify what caused the notification.
    //
    // Examples:
    //
    // QUIZ
    // NOTE
    // SUBJECT
    // UNIT
    // TOPIC
    // CLASSROOM
    // =====================================================

    @Column(name = "reference_type")
    private String referenceType;

    // =====================================================
    // OPTIONAL REFERENCE ID
    // =====================================================

    @Column(name = "reference_id")
    private Long referenceId;

    // =====================================================
    // EMPTY CONSTRUCTOR
    // =====================================================

    public Notification() {
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Notification(
            User user,
            String title,
            String message,
            String type) {

        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    // =====================================================
    // GETTERS AND SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(
            String referenceType) {

        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(
            Long referenceId) {

        this.referenceId = referenceId;
    }
}