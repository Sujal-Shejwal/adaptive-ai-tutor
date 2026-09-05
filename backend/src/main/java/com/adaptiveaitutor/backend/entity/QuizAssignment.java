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
        name = "quiz_assignments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_classroom_quiz",
                        columnNames = {
                                "classroom_id",
                                "quiz_id"
                        }
                )
        }
)
public class QuizAssignment {

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
    // QUIZ
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "quiz_id",
            nullable = false
    )
    private Quiz quiz;

    // =====================================================
    // ASSIGNED AT
    // =====================================================

    @Column(
            name = "assigned_at",
            nullable = false
    )
    private LocalDateTime assignedAt;

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

    public QuizAssignment() {
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public QuizAssignment(
            Classroom classroom,
            Quiz quiz) {

        this.classroom = classroom;
        this.quiz = quiz;

        this.assignedAt =
                LocalDateTime.now();

        this.status = "ACTIVE";
    }

    // =====================================================
    // ID
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(
            Long id) {

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
    // QUIZ
    // =====================================================

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(
            Quiz quiz) {

        this.quiz = quiz;
    }

    // =====================================================
    // ASSIGNED AT
    // =====================================================

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(
            LocalDateTime assignedAt) {

        this.assignedAt = assignedAt;
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