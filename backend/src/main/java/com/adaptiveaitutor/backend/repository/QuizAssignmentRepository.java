package com.adaptiveaitutor.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.QuizAssignment;

public interface QuizAssignmentRepository
        extends JpaRepository<QuizAssignment, Long> {

    // =====================================================
    // CHECK DUPLICATE ASSIGNMENT
    // =====================================================

    boolean existsByClassroomIdAndQuizId(
            Long classroomId,
            Long quizId
    );

    // =====================================================
    // GET ONE ASSIGNMENT
    // =====================================================

    Optional<QuizAssignment>
            findByClassroomIdAndQuizId(
                    Long classroomId,
                    Long quizId
            );

    // =====================================================
    // GET CLASSROOM ASSIGNMENTS
    // =====================================================

    List<QuizAssignment>
            findByClassroomId(
                    Long classroomId
            );

    // =====================================================
    // GET ACTIVE CLASSROOM ASSIGNMENTS
    // =====================================================

    List<QuizAssignment>
            findByClassroomIdAndStatus(
                    Long classroomId,
                    String status
            );

    // =====================================================
    // GET ASSIGNMENTS FOR MULTIPLE CLASSROOMS
    // =====================================================

    List<QuizAssignment>
            findByClassroomIdIn(
                    List<Long> classroomIds
            );

    // =====================================================
    // GET ACTIVE ASSIGNMENTS FOR MULTIPLE CLASSROOMS
    // =====================================================

    List<QuizAssignment>
            findByClassroomIdInAndStatus(
                    List<Long> classroomIds,
                    String status
            );
}