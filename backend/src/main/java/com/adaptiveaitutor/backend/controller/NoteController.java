package com.adaptiveaitutor.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.adaptiveaitutor.backend.entity.Note;
import com.adaptiveaitutor.backend.entity.Topic;
import com.adaptiveaitutor.backend.repository.TopicRepository;
import com.adaptiveaitutor.backend.service.NoteService;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class NoteController {

    private final NoteService noteService;
    private final TopicRepository topicRepository;

    private final Path uploadDirectory =
            Paths.get("uploads");

    public NoteController(
            NoteService noteService,
            TopicRepository topicRepository) {

        this.noteService = noteService;
        this.topicRepository = topicRepository;
    }

    // =====================================================
    // GET NOTES BY TOPIC
    // =====================================================

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<Note>> getNotesByTopic(
            @PathVariable Long topicId) {

        return ResponseEntity.ok(
                noteService.getNotesByTopicId(topicId)
        );
    }

    // =====================================================
    // GET NOTE BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(
            @PathVariable Long id) {

        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================================
    // VIEW / OPEN PDF FILE
    // =====================================================

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getNoteFile(
            @PathVariable Long id) {

        try {

            // Find note from database
            Note note = noteService.getNoteById(id)
                    .orElse(null);

            if (note == null) {
                return ResponseEntity.notFound().build();
            }

            // Get file path from database
            Path filePath = Paths.get(note.getFilePath());

            // Check file exists
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            // Convert file into Spring Resource
            Resource resource =
                    new UrlResource(filePath.toUri());

            if (!resource.exists() ||
                    !resource.isReadable()) {

                return ResponseEntity.notFound().build();
            }

            // Return PDF to browser
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    note.getFileName() +
                                    "\""
                    )
                    .body(resource);

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    // =====================================================
    // UPLOAD NOTE
    // =====================================================

    @PostMapping("/upload")
    public ResponseEntity<Note> uploadNote(
            @RequestParam("file") MultipartFile file,
            @RequestParam("topicId") Long topicId) {

        try {

            // Check file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Only PDF
            String originalFileName =
                    file.getOriginalFilename();

            if (originalFileName == null ||
                    !originalFileName
                            .toLowerCase()
                            .endsWith(".pdf")) {

                return ResponseEntity.badRequest().build();
            }

            // Find topic
            Topic topic = topicRepository
                    .findById(topicId)
                    .orElse(null);

            if (topic == null) {
                return ResponseEntity.notFound().build();
            }

            // Create uploads directory
            Files.createDirectories(uploadDirectory);

            // Create unique file name
            String storedFileName =
                    UUID.randomUUID()
                            + "_"
                            + originalFileName;

            Path filePath =
                    uploadDirectory.resolve(storedFileName);

            // Save PDF to uploads folder
            Files.copy(
                    file.getInputStream(),
                    filePath
            );

            // Save database record
            Note note = new Note(
                    originalFileName,
                    filePath.toString(),
                    topic
            );

            Note savedNote =
                    noteService.createNote(note);

            return ResponseEntity.ok(savedNote);

        } catch (IOException exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    // =====================================================
    // DELETE NOTE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long id) {

        try {

            Note note = noteService.getNoteById(id)
                    .orElse(null);

            if (note == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete physical PDF file
            Path filePath =
                    Paths.get(note.getFilePath());

            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

            // Delete database record
            noteService.deleteNote(id);

            return ResponseEntity.noContent().build();

        } catch (IOException exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }
}