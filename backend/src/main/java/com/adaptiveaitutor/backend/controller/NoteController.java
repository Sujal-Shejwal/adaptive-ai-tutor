package com.adaptiveaitutor.backend.controller;

import java.io.IOException;
import java.net.URI;
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
import com.adaptiveaitutor.backend.service.RagIngestionService;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class NoteController {

    private final NoteService noteService;

    private final TopicRepository topicRepository;

    private final RagIngestionService ragIngestionService;

    private final Path uploadDirectory =
            Paths.get("uploads");

    public NoteController(
            NoteService noteService,
            TopicRepository topicRepository,
            RagIngestionService ragIngestionService) {

        this.noteService =
                noteService;

        this.topicRepository =
                topicRepository;

        this.ragIngestionService =
                ragIngestionService;
    }

    // =====================================================
    // GET ALL NOTES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {

        return ResponseEntity.ok(
                noteService.getAllNotes()
        );
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

        return noteService
                .getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =====================================================
    // VIEW / OPEN PDF FILE
    // =====================================================

    @GetMapping("/{id}/file")
    public ResponseEntity<?> getNoteFile(
            @PathVariable Long id) {

        try {

            // -------------------------------------------------
            // Find note from database
            // -------------------------------------------------

            Note note =
                    noteService
                            .getNoteById(id)
                            .orElse(null);

            if (note == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            String filePath =
                    note.getFilePath();

            // -------------------------------------------------
            // VERCEL BLOB PDF
            // -------------------------------------------------

            if (
                    filePath.startsWith("https://") ||
                    filePath.startsWith("http://")
            ) {

                return ResponseEntity
                        .status(302)
                        .location(
                                URI.create(filePath)
                        )
                        .build();
            }

            // -------------------------------------------------
            // LOCAL PDF
            // -------------------------------------------------

            Path localFilePath =
                    Paths.get(filePath);

            if (!Files.exists(localFilePath)) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            Resource resource =
                    new UrlResource(
                            localFilePath.toUri()
                    );

            if (
                    !resource.exists() ||
                    !resource.isReadable()
            ) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.APPLICATION_PDF
                    )
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
    // UPLOAD NOTE - LOCAL / EXISTING FLOW
    // =====================================================

    @PostMapping("/upload")
    public ResponseEntity<Note> uploadNote(
            @RequestParam("file") MultipartFile file,
            @RequestParam("topicId") Long topicId) {

        try {

            // -------------------------------------------------
            // Check file
            // -------------------------------------------------

            if (file.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            // -------------------------------------------------
            // Original file name
            // -------------------------------------------------

            String originalFileName =
                    file.getOriginalFilename();

            // -------------------------------------------------
            // Only PDF
            // -------------------------------------------------

            if (
                    originalFileName == null ||
                    !originalFileName
                            .toLowerCase()
                            .endsWith(".pdf")
            ) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            // -------------------------------------------------
            // Find topic
            // -------------------------------------------------

            Topic topic =
                    topicRepository
                            .findById(topicId)
                            .orElse(null);

            if (topic == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // -------------------------------------------------
            // Create uploads directory
            // -------------------------------------------------

            Files.createDirectories(
                    uploadDirectory
            );

            // -------------------------------------------------
            // Create unique file name
            // -------------------------------------------------

            String storedFileName =
                    UUID.randomUUID()
                            + "_"
                            + originalFileName;

            Path filePath =
                    uploadDirectory.resolve(
                            storedFileName
                    );

            // -------------------------------------------------
            // Save PDF
            // -------------------------------------------------

            Files.copy(
                    file.getInputStream(),
                    filePath
            );

            // -------------------------------------------------
            // Save Note
            // -------------------------------------------------

            Note note =
                    new Note(
                            originalFileName,
                            filePath.toString(),
                            topic
                    );

            Note savedNote =
                    noteService.createNote(
                            note
                    );

            // =================================================
            // AUTOMATIC RAG INGESTION
            // =================================================

            ragIngestionService.ingestNote(
                    savedNote.getId()
            );

            // -------------------------------------------------
            // Return saved note
            // -------------------------------------------------

            return ResponseEntity.ok(
                    savedNote
            );

        } catch (IOException exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();

        } catch (RuntimeException exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    // =====================================================
    // UPLOAD NOTE - VERCEL BLOB FLOW
    // =====================================================

    @PostMapping("/blob")
    public ResponseEntity<Note> uploadFromBlob(
            @RequestParam("fileName") String fileName,
            @RequestParam("blobUrl") String blobUrl,
            @RequestParam("topicId") Long topicId) {

        try {

            // -------------------------------------------------
            // Validate file name
            // -------------------------------------------------

            if (
                    fileName == null ||
                    fileName.isBlank()
            ) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            // -------------------------------------------------
            // Validate Blob URL
            // -------------------------------------------------

            if (
                    blobUrl == null ||
                    blobUrl.isBlank()
            ) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            if (
                    !blobUrl.startsWith("https://") &&
                    !blobUrl.startsWith("http://")
            ) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            // -------------------------------------------------
            // Only PDF
            // -------------------------------------------------

            if (
                    !fileName
                            .toLowerCase()
                            .endsWith(".pdf")
            ) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            // -------------------------------------------------
            // Find topic
            // -------------------------------------------------

            Topic topic =
                    topicRepository
                            .findById(topicId)
                            .orElse(null);

            if (topic == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // -------------------------------------------------
            // Save Blob URL in Note
            // -------------------------------------------------

            Note note =
                    new Note(
                            fileName,
                            blobUrl,
                            topic
                    );

            Note savedNote =
                    noteService.createNote(
                            note
                    );

            // =================================================
            // AUTOMATIC RAG INGESTION
            // =================================================

            ragIngestionService.ingestNote(
                    savedNote.getId()
            );

            // -------------------------------------------------
            // Return saved note
            // -------------------------------------------------

            return ResponseEntity.ok(
                    savedNote
            );

        } catch (RuntimeException exception) {

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

            // -------------------------------------------------
            // Find note
            // -------------------------------------------------

            Note note =
                    noteService
                            .getNoteById(id)
                            .orElse(null);

            if (note == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // -------------------------------------------------
            // Delete PGVector chunks
            // -------------------------------------------------

            int deletedVectorChunks =
                    ragIngestionService
                            .deleteVectorsForNote(id);

            System.out.println(
                    "Deleted " +
                            deletedVectorChunks +
                            " vector chunks for note " +
                            id
            );

            // -------------------------------------------------
            // Delete physical PDF file
            // -------------------------------------------------

            String filePath =
                    note.getFilePath();

            // Only delete local files.
            // Vercel Blob files are not local files.
            if (
                    filePath != null &&
                    !filePath.startsWith("https://") &&
                    !filePath.startsWith("http://")
            ) {

                Path localFilePath =
                        Paths.get(filePath);

                if (Files.exists(localFilePath)) {

                    Files.delete(localFilePath);
                }
            }

            // -------------------------------------------------
            // Delete Note database record
            // -------------------------------------------------

            noteService.deleteNote(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IOException exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();

        } catch (RuntimeException exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }
}