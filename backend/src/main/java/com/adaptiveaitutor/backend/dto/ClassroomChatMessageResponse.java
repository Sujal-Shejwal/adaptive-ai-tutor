package com.adaptiveaitutor.backend.dto;

import java.time.LocalDateTime;

public class ClassroomChatMessageResponse {

    private Long id;

    private Long classroomId;

    private Long senderId;

    private String senderName;

    private String senderRole;

    private String content;

    private LocalDateTime createdAt;


    // =====================================================
    // EMPTY CONSTRUCTOR
    // =====================================================

    public ClassroomChatMessageResponse() {
    }


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ClassroomChatMessageResponse(
            Long id,
            Long classroomId,
            Long senderId,
            String senderName,
            String senderRole,
            String content,
            LocalDateTime createdAt) {

        this.id =
                id;

        this.classroomId =
                classroomId;

        this.senderId =
                senderId;

        this.senderName =
                senderName;

        this.senderRole =
                senderRole;

        this.content =
                content;

        this.createdAt =
                createdAt;
    }


    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(
            Long id) {

        this.id =
                id;
    }


    public Long getClassroomId() {
        return classroomId;
    }

    public void setClassroomId(
            Long classroomId) {

        this.classroomId =
                classroomId;
    }


    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(
            Long senderId) {

        this.senderId =
                senderId;
    }


    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(
            String senderName) {

        this.senderName =
                senderName;
    }


    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(
            String senderRole) {

        this.senderRole =
                senderRole;
    }


    public String getContent() {
        return content;
    }

    public void setContent(
            String content) {

        this.content =
                content;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }
}