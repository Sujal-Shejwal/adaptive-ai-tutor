package com.adaptiveaitutor.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;

public interface ClassroomEnrollmentRepository
        extends JpaRepository<ClassroomEnrollment, Long> {

    // =====================================================
    // GET ALL STUDENTS IN CLASSROOM
    // =====================================================

    List<ClassroomEnrollment> findByClassroomId(
            Long classroomId
    );

    // =====================================================
    // GET ALL CLASSROOMS FOR STUDENT
    // =====================================================

    List<ClassroomEnrollment> findByStudentId(
            Long studentId
    );

    // =====================================================
    // CHECK EXISTING ENROLLMENT
    // =====================================================

    boolean existsByClassroomIdAndStudentId(
            Long classroomId,
            Long studentId
    );

    // =====================================================
    // GET SPECIFIC ENROLLMENT
    // =====================================================

    Optional<ClassroomEnrollment>
            findByClassroomIdAndStudentId(
                    Long classroomId,
                    Long studentId
            );
}