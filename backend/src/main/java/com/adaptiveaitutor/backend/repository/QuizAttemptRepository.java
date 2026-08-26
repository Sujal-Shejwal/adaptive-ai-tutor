package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.QuizAttempt;

public interface QuizAttemptRepository
        extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByStudentId(Long studentId);

    List<QuizAttempt> findByQuizId(Long quizId);

    boolean existsByQuizIdAndStudentId(
            Long quizId,
            Long studentId
    );
}