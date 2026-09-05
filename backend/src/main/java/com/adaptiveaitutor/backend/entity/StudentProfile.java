package com.adaptiveaitutor.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Links this profile to the existing User account.
    // One student profile belongs to one User.
    @OneToOne
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    // Human-readable student identifier.
    @Column(
            name = "student_id",
            nullable = false,
            unique = true
    )
    private String studentId;

    // True until the student changes the temporary password.
    @Column(
            name = "must_change_password",
            nullable = false
    )
    private boolean mustChangePassword = true;

    // Temporary credential expiration time.
    @Column(name = "temporary_password_expires_at")
    private LocalDateTime temporaryPasswordExpiresAt;

    public StudentProfile() {
    }

    public StudentProfile(
            User user,
            String studentId,
            boolean mustChangePassword,
            LocalDateTime temporaryPasswordExpiresAt
    ) {
        this.user = user;
        this.studentId = studentId;
        this.mustChangePassword = mustChangePassword;
        this.temporaryPasswordExpiresAt =
                temporaryPasswordExpiresAt;
    }

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

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(
            boolean mustChangePassword
    ) {
        this.mustChangePassword =
                mustChangePassword;
    }

    public LocalDateTime getTemporaryPasswordExpiresAt() {
        return temporaryPasswordExpiresAt;
    }

    public void setTemporaryPasswordExpiresAt(
            LocalDateTime temporaryPasswordExpiresAt
    ) {
        this.temporaryPasswordExpiresAt =
                temporaryPasswordExpiresAt;
    }
}