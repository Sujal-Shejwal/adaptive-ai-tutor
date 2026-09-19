package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Quiz;

public interface QuizRepository
        extends JpaRepository<Quiz, Long> {

    // =====================================================
    // GET QUIZZES BY SUBJECT
    // =====================================================

    List<Quiz> findBySubjectId(
            Long subjectId
    );

    // =====================================================
    // GET QUIZZES BY TOPIC
    // =====================================================

    List<Quiz> findByTopicId(
            Long topicId
    );

    // =====================================================
    // GET QUIZZES BY TEACHER
    // =====================================================

    List<Quiz> findByCreatedById(
            Long teacherId
    );
}