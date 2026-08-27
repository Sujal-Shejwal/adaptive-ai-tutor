package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Note;
import com.adaptiveaitutor.backend.repository.NoteRepository;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(
            NoteRepository noteRepository) {

        this.noteRepository =
                noteRepository;
    }

    // =====================================================
    // GET ALL NOTES
    // =====================================================

    public List<Note> getAllNotes() {

        return noteRepository.findAll();
    }

    // =====================================================
    // GET NOTES BY TOPIC
    // =====================================================

    public List<Note> getNotesByTopicId(
            Long topicId) {

        return noteRepository
                .findByTopicId(topicId);
    }

    // =====================================================
    // GET NOTE BY ID
    // =====================================================

    public Optional<Note> getNoteById(
            Long id) {

        return noteRepository
                .findById(id);
    }

    // =====================================================
    // CREATE / SAVE NOTE
    // =====================================================

    public Note createNote(
            Note note) {

        return noteRepository.save(
                note
        );
    }

    // =====================================================
    // DELETE NOTE
    // =====================================================

    public void deleteNote(
            Long id) {

        noteRepository.deleteById(id);
    }
}