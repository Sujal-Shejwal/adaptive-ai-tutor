package com.adaptiveaitutor.backend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer duration;

    // =====================================================
    // QUIZ DEADLINE
    // =====================================================

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    // =====================================================
    // SUBJECT
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    // =====================================================
    // CREATED BY
    // =====================================================

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // =====================================================
    // QUESTIONS
    // =====================================================

    @JsonIgnore
    @OneToMany(
            mappedBy = "quiz",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<QuizQuestion> questions =
            new ArrayList<>();

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public Quiz() {
    }

    public Quiz(
            String title,
            Integer duration,
            Subject subject,
            User createdBy) {

        this.title = title;
        this.duration = duration;
        this.subject = subject;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(
            LocalDateTime dueAt) {

        this.dueAt = dueAt;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public List<QuizQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(
            List<QuizQuestion> questions) {

        this.questions = questions;
    }

    // =====================================================
    // ADD QUESTION
    // =====================================================

    public void addQuestion(
            QuizQuestion question) {

        questions.add(question);

        question.setQuiz(this);
    }

    // =====================================================
    // REMOVE QUESTION
    // =====================================================

    public void removeQuestion(
            QuizQuestion question) {

        questions.remove(question);

        question.setQuiz(null);
    }
}