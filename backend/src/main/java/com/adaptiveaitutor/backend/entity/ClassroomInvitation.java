package com.adaptiveaitutor.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "classroom_invitations")
public class ClassroomInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // CLASSROOM
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "classroom_id",
            nullable = false
    )
    private Classroom classroom;

    // =====================================================
    // SECURE TOKEN
    // =====================================================

    @Column(
            nullable = false,
            unique = true,
            length = 128
    )
    private String token;

    // =====================================================
    // STATUS
    // =====================================================

    @Column(
            nullable = false,
            length = 20
    )
    private String status;

    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    // =====================================================
    // EXPIRES AT
    // =====================================================

    @Column(
            name = "expires_at",
            nullable = false
    )
    private LocalDateTime expiresAt;

    // =====================================================
    // ACCEPTED AT
    // =====================================================

    @Column(
            name = "accepted_at"
    )
    private LocalDateTime acceptedAt;

    // =====================================================
    // EMPTY CONSTRUCTOR
    // =====================================================

    public ClassroomInvitation() {
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ClassroomInvitation(
            Classroom classroom,
            String token,
            LocalDateTime createdAt,
            LocalDateTime expiresAt) {

        this.classroom = classroom;
        this.token = token;
        this.status = "PENDING";
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    // =====================================================
    // ID
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // =====================================================
    // CLASSROOM
    // =====================================================

    public Classroom getClassroom() {
        return classroom;
    }

    public void setClassroom(
            Classroom classroom) {

        this.classroom = classroom;
    }

    // =====================================================
    // TOKEN
    // =====================================================

    public String getToken() {
        return token;
    }

    public void setToken(
            String token) {

        this.token = token;
    }

    // =====================================================
    // STATUS
    // =====================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status) {

        this.status = status;
    }

    // =====================================================
    // CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }

    // =====================================================
    // EXPIRES AT
    // =====================================================

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(
            LocalDateTime expiresAt) {

        this.expiresAt = expiresAt;
    }

    // =====================================================
    // ACCEPTED AT
    // =====================================================

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(
            LocalDateTime acceptedAt) {

        this.acceptedAt = acceptedAt;
    }
}