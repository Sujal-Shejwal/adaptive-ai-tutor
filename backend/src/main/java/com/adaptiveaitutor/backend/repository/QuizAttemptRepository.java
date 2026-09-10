package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.QuizAttempt;

public interface QuizAttemptRepository
        extends JpaRepository<QuizAttempt, Long> {

    // =====================================================
    // GET ATTEMPTS BY STUDENT
    // =====================================================

    List<QuizAttempt> findByStudentId(
            Long studentId
    );

    // =====================================================
    // GET ATTEMPTS BY QUIZ
    // =====================================================

    List<QuizAttempt> findByQuizId(
            Long quizId
    );

    // =====================================================
    // GET ALL ATTEMPTS FOR TEACHER
    // =====================================================
    //
    // Finds attempts for quizzes created by this teacher.
    // =====================================================

    List<QuizAttempt> findByQuizCreatedById(
            Long teacherId
    );

    // =====================================================
    // CHECK WHETHER A STUDENT ALREADY ATTEMPTED A QUIZ
    // =====================================================

    boolean existsByQuizIdAndStudentId(
            Long quizId,
            Long studentId
    );

    // =====================================================
    // CHECK WHETHER QUIZ HAS ANY SUBMISSIONS
    // =====================================================

    boolean existsByQuizId(
            Long quizId
    );
}