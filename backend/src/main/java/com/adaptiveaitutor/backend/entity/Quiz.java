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

    // =====================================================
    // QUIZ DETAILS
    // =====================================================

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer duration;

    // =====================================================
    // DATES
    // =====================================================

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    // =====================================================
    // ADAPTIVE AI
    // =====================================================

    @Column(
            name = "is_adaptive",
            nullable = false
    )
    private boolean adaptive = false;

    @Column(name = "difficulty")
    private String difficulty;

    // =====================================================
    // SUBJECT
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "subject_id",
            nullable = false
    )
    private Subject subject;

    // =====================================================
    // TOPIC
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "topic_id"
    )
    private Topic topic;

    // =====================================================
    // CREATED BY
    // =====================================================

    @JsonIgnore
    @ManyToOne
    @JoinColumn(
            name = "created_by",
            nullable = false
    )
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
    // EMPTY CONSTRUCTOR
    // =====================================================

    public Quiz() {
    }

    // =====================================================
    // EXISTING CONSTRUCTOR
    // =====================================================
    //
    // Used by normal teacher-created quizzes.
    // =====================================================

    public Quiz(
            String title,
            Integer duration,
            Subject subject,
            User createdBy) {

        this.title = title;
        this.duration = duration;
        this.subject = subject;
        this.createdBy = createdBy;

        this.createdAt =
                LocalDateTime.now();

        this.adaptive = false;
        this.difficulty = null;
    }

    // =====================================================
    // TOPIC-AWARE CONSTRUCTOR
    // =====================================================
    //
    // Used by topic-based quiz creation.
    // =====================================================

    public Quiz(
            String title,
            Integer duration,
            Subject subject,
            Topic topic,
            User createdBy) {

        this.title = title;
        this.duration = duration;
        this.subject = subject;
        this.topic = topic;
        this.createdBy = createdBy;

        this.createdAt =
                LocalDateTime.now();

        this.adaptive = false;
        this.difficulty = null;
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
    // TITLE
    // =====================================================

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title) {

        this.title = title;
    }

    // =====================================================
    // DURATION
    // =====================================================

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(
            Integer duration) {

        this.duration = duration;
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
    // ADAPTIVE
    // =====================================================

    public boolean isAdaptive() {
        return adaptive;
    }

    public void setAdaptive(
            boolean adaptive) {

        this.adaptive = adaptive;
    }

    // =====================================================
    // DIFFICULTY
    // =====================================================

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(
            String difficulty) {

        this.difficulty = difficulty;
    }

    // =====================================================
    // SUBJECT
    // =====================================================

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(
            Subject subject) {

        this.subject = subject;
    }

    // =====================================================
    // TOPIC
    // =====================================================

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(
            Topic topic) {

        this.topic = topic;
    }

    // =====================================================
    // CREATED BY
    // =====================================================

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(
            User createdBy) {

        this.createdBy = createdBy;
    }

    // =====================================================
    // QUESTIONS
    // =====================================================

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

        if (question == null) {
            return;
        }

        questions.add(
                question
        );

        question.setQuiz(
                this
        );
    }

    // =====================================================
    // REMOVE QUESTION
    // =====================================================

    public void removeQuestion(
            QuizQuestion question) {

        if (question == null) {
            return;
        }

        questions.remove(
                question
        );

        question.setQuiz(
                null
        );
    }
}