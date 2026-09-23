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
@Table(name = "classroom_chat_messages")
public class ClassroomChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // CLASSROOM
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "classroom_id",
            nullable = false
    )
    private Classroom classroom;


    // =====================================================
    // SENDER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "sender_id",
            nullable = false
    )
    private User sender;


    // =====================================================
    // MESSAGE
    // =====================================================

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String content;


    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ClassroomChatMessage() {
    }


    public ClassroomChatMessage(
            Classroom classroom,
            User sender,
            String content) {

        this.classroom =
                classroom;

        this.sender =
                sender;

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

        this.id =
                id;
    }


    public Classroom getClassroom() {
        return classroom;
    }


    public void setClassroom(
            Classroom classroom) {

        this.classroom =
                classroom;
    }


    public User getSender() {
        return sender;
    }


    public void setSender(
            User sender) {

        this.sender =
                sender;
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