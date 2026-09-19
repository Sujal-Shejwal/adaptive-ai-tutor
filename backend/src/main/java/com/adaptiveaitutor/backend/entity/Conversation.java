package com.adaptiveaitutor.backend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String subject;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =====================================================
    // CONVERSATION MESSAGES
    // =====================================================

    @JsonIgnore
    @OneToMany(
            mappedBy = "conversation",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<ChatMessage> messages =
            new ArrayList<>();

    public Conversation() {
    }

    public Conversation(
            String title,
            String subject) {

        this.title =
                title;

        this.subject =
                subject;

        this.createdAt =
                LocalDateTime.now();

        this.updatedAt =
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

        this.id =
                id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title) {

        this.title =
                title;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(
            String subject) {

        this.subject =
                subject;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {

        this.updatedAt =
                updatedAt;
    }

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public void setMessages(
            List<ChatMessage> messages) {

        this.messages =
                messages;
    }

    // =====================================================
    // ADD MESSAGE
    // =====================================================

    public void addMessage(
            ChatMessage message) {

        messages.add(
                message
        );

        message.setConversation(
                this
        );

        updatedAt =
                LocalDateTime.now();
    }

    // =====================================================
    // REMOVE MESSAGE
    // =====================================================

    public void removeMessage(
            ChatMessage message) {

        messages.remove(
                message
        );

        message.setConversation(
                null
        );

        updatedAt =
                LocalDateTime.now();
    }
}