package com.adaptiveaitutor.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Classroom;

public interface ClassroomRepository
        extends JpaRepository<Classroom, Long> {

    // Get all classrooms owned by a teacher
    List<Classroom> findByTeacherId(Long teacherId);

    // Find classroom using student join code
    Optional<Classroom> findByJoinCode(String joinCode);

    // Check whether a join code already exists
    boolean existsByJoinCode(String joinCode);
}