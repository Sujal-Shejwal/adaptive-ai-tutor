package com.adaptiveaitutor.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.ClassroomInvitation;

public interface ClassroomInvitationRepository
        extends JpaRepository<ClassroomInvitation, Long> {

    // =====================================================
    // FIND BY TOKEN
    // =====================================================

    Optional<ClassroomInvitation>
            findByToken(
                    String token
            );

    // =====================================================
    // GET INVITATIONS FOR CLASSROOM
    // =====================================================

    List<ClassroomInvitation>
            findByClassroomId(
                    Long classroomId
            );

    // =====================================================
    // CHECK TOKEN
    // =====================================================

    boolean existsByToken(
            String token
    );
}