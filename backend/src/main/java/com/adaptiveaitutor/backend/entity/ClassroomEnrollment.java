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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "classroom_enrollments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_classroom_student",
                        columnNames = {
                                "classroom_id",
                                "student_id"
                        }
                )
        }
)
public class ClassroomEnrollment {

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
    // STUDENT
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private User student;

    // =====================================================
    // JOINED AT
    // =====================================================

    @Column(
            name = "joined_at",
            nullable = false
    )
    private LocalDateTime joinedAt;

    // =====================================================
    // STATUS
    // =====================================================

    @Column(
            nullable = false
    )
    private String status;

    // =====================================================
    // EMPTY CONSTRUCTOR
    // =====================================================

    public ClassroomEnrollment() {
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ClassroomEnrollment(
            Classroom classroom,
            User student) {

        this.classroom = classroom;
        this.student = student;
        this.joinedAt = LocalDateTime.now();
        this.status = "ACTIVE";
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
    // STUDENT
    // =====================================================

    public User getStudent() {
        return student;
    }

    public void setStudent(
            User student) {

        this.student = student;
    }

    // =====================================================
    // JOINED AT
    // =====================================================

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(
            LocalDateTime joinedAt) {

        this.joinedAt = joinedAt;
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
}