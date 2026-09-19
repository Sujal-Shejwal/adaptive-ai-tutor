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
@Table(name = "classrooms")
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // CLASSROOM NAME
    // =====================================================

    @Column(nullable = false)
    private String name;

    // =====================================================
    // UNIQUE JOIN CODE
    // =====================================================

    @Column(
            name = "join_code",
            nullable = false,
            unique = true
    )
    private String joinCode;

    // =====================================================
    // TEACHER
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "teacher_id",
            nullable = false
    )
    private User teacher;

    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    // =====================================================
    // EMPTY CONSTRUCTOR
    // =====================================================

    public Classroom() {
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Classroom(
            String name,
            String joinCode,
            User teacher) {

        this.name = name;
        this.joinCode = joinCode;
        this.teacher = teacher;
        this.createdAt = LocalDateTime.now();
    }

    // =====================================================
    // GET ID
    // =====================================================

    public Long getId() {
        return id;
    }

    // =====================================================
    // SET ID
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    // =====================================================
    // GET NAME
    // =====================================================

    public String getName() {
        return name;
    }

    // =====================================================
    // SET NAME
    // =====================================================

    public void setName(String name) {
        this.name = name;
    }

    // =====================================================
    // GET JOIN CODE
    // =====================================================

    public String getJoinCode() {
        return joinCode;
    }

    // =====================================================
    // SET JOIN CODE
    // =====================================================

    public void setJoinCode(String joinCode) {
        this.joinCode = joinCode;
    }

    // =====================================================
    // GET TEACHER
    // =====================================================

    public User getTeacher() {
        return teacher;
    }

    // =====================================================
    // SET TEACHER
    // =====================================================

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    // =====================================================
    // GET CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // =====================================================
    // SET CREATED AT
    // =====================================================

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}