package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Note;

public interface NoteRepository
        extends JpaRepository<Note, Long> {

    // =====================================================
    // GET NOTES BY TOPIC
    // =====================================================

    List<Note> findByTopicId(Long topicId);
}