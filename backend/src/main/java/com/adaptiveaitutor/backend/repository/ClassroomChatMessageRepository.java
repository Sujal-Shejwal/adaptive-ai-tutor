package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.ClassroomChatMessage;

public interface ClassroomChatMessageRepository
        extends JpaRepository<
                ClassroomChatMessage,
                Long> {


    // =====================================================
    // GET CLASSROOM CHAT HISTORY
    // =====================================================

    List<ClassroomChatMessage>
    findByClassroomIdOrderByCreatedAtAsc(
            Long classroomId
    );
}