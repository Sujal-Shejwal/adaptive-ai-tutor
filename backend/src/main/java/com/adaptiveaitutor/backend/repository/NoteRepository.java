package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Note;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByTopicId(Long topicId);
}