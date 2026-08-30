package com.adaptiveaitutor.backend.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String role;

    // AI responses can be very long
    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    public ChatMessage() {
    }

    public ChatMessage(
            String role,
            String content) {

        this.role = role;

        this.content =
                content;

        this.createdAt =
                LocalDateTime.now();
    }

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(
            Long id) {

        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(
            String role) {

        this.role =
                role;
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

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(
            Conversation conversation) {

        this.conversation =
                conversation;
    }
}