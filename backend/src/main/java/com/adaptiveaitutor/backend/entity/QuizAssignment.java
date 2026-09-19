package com.adaptiveaitutor.backend.entity;

import java.time.Duration;
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
    // DUE AT
    // =====================================================

    /*
     * Deadline for this specific classroom assignment.
     *
     * This is different from Quiz.dueAt.
     *
     * Quiz.dueAt represents the original deadline calculated
     * when the quiz was created.
     *
     * Assignment.dueAt represents the deadline starting from
     * the time the quiz was assigned to this classroom.
     */
    @Column(
            name = "due_at"
    )
    private LocalDateTime dueAt;

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

        // -------------------------------------------------
        // SET ASSIGNMENT TIME
        // -------------------------------------------------

        this.assignedAt =
                LocalDateTime.now();

        // -------------------------------------------------
        // CALCULATE ASSIGNMENT DEADLINE
        // -------------------------------------------------

        /*
         * The original QuizService calculates Quiz.dueAt
         * from Quiz.createdAt.
         *
         * Example:
         *
         * Quiz created  ->  Sep 5, 10:00 AM
         * Quiz dueAt    ->  Sep 6, 10:00 AM
         *
         * This means the selected deadline was 24 hours.
         *
         * When the teacher assigns the quiz later, we reuse
         * that same duration from the new assignedAt time.
         *
         * Example:
         *
         * Assigned at  ->  Sep 8, 07:00 PM
         * Assignment dueAt -> Sep 9, 07:00 PM
         */

        if (
                quiz != null &&
                quiz.getCreatedAt() != null &&
                quiz.getDueAt() != null
        ) {

            Duration deadlineDuration =
                    Duration.between(
                            quiz.getCreatedAt(),
                            quiz.getDueAt()
                    );

            this.dueAt =
                    this.assignedAt.plus(
                            deadlineDuration
                    );
        }

        // -------------------------------------------------
        // DEFAULT STATUS
        // -------------------------------------------------

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
    // DUE AT
    // =====================================================

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(
            LocalDateTime dueAt) {

        this.dueAt = dueAt;
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