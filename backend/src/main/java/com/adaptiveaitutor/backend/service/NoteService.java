package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Note;
import com.adaptiveaitutor.backend.repository.NoteRepository;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    // Get all notes belonging to a topic
    public List<Note> getNotesByTopicId(Long topicId) {
        return noteRepository.findByTopicId(topicId);
    }

    // Get a single note by ID
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    // Create/save a new note
    public Note createNote(Note note) {
        return noteRepository.save(note);
    }

    // Delete a note by ID
    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }
}