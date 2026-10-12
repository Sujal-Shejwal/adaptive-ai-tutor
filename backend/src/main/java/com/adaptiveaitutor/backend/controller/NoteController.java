
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
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://adaptiveaitutor.me",
        "https://www.adaptiveaitutor.me",
        "https://adaptive-ai-tutor-gamma.vercel.app"
})
public class NoteController {

    private final NoteService noteService;
    private final TopicRepository topicRepository;
    private final RagIngestionService ragIngestionService;

    private final Path uploadDirectory = Paths.get("uploads");

    public NoteController(
            NoteService noteService,
            TopicRepository topicRepository,
            RagIngestionService ragIngestionService) {

        this.noteService = noteService;
        this.topicRepository = topicRepository;
        this.ragIngestionService = ragIngestionService;
    }

    // GET ALL NOTES
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    // GET NOTES BY TOPIC
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<Note>> getNotesByTopic(
            @PathVariable Long topicId) {

        return ResponseEntity.ok(
                noteService.getNotesByTopicId(topicId));
    }

    // GET NOTE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(
            @PathVariable Long id) {

        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // VIEW / OPEN PDF FILE
    @GetMapping("/{id}/file")
    public ResponseEntity<?> getNoteFile(@PathVariable Long id) {

        try {
            Note note = noteService.getNoteById(id).orElse(null);

            if (note == null) {
                return ResponseEntity.notFound().build();
            }

            String filePath = note.getFilePath();

            if (filePath == null || filePath.isBlank()) {
                return ResponseEntity.notFound().build();
            }

            // Redirect Blob-hosted PDFs to their public HTTPS URL.
            if (filePath.startsWith("https://")) {
                URI uri = URI.create(filePath);

                if (uri.getHost() == null) {
                    return ResponseEntity.badRequest().build();
                }

                return ResponseEntity
                        .status(302)
                        .location(uri)
                        .build();
            }

            // Reject insecure remote URLs.
            if (filePath.startsWith("http://")) {
                return ResponseEntity.badRequest().build();
            }

            // Local files work only when the file exists on this server.
            Path localFilePath = Paths.get(filePath);

            if (!Files.exists(localFilePath)
                    || !Files.isRegularFile(localFilePath)
                    || !Files.isReadable(localFilePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(localFilePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String fileName = note.getFileName() == null
                    ? "document.pdf"
                    : note.getFileName();

            String safeFileName = fileName
                    .replace("\"", "")
                    .replace("\r", "")
                    .replace("\n", "");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + safeFileName + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // UPLOAD NOTE - LOCAL / EXISTING FLOW
    @PostMapping("/upload")
    public ResponseEntity<Note> uploadNote(
            @RequestParam("file") MultipartFile file,
            @RequestParam("topicId") Long topicId) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            String originalFileName = file.getOriginalFilename();

            if (originalFileName == null
                    || !originalFileName.toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().build();
            }

            Topic topic = topicRepository.findById(topicId).orElse(null);

            if (topic == null) {
                return ResponseEntity.notFound().build();
            }

            Files.createDirectories(uploadDirectory);

            String storedFileName = UUID.randomUUID()
                    + "_"
                    + Paths.get(originalFileName).getFileName();

            Path filePath = uploadDirectory.resolve(storedFileName);

            Files.copy(file.getInputStream(), filePath);

            Note note = new Note(
                    originalFileName,
                    filePath.toString(),
                    topic);

            Note savedNote = noteService.createNote(note);

            ragIngestionService.ingestNote(savedNote.getId());

            return ResponseEntity.ok(savedNote);

        } catch (IOException | RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // UPLOAD NOTE - VERCEL BLOB FLOW
    @PostMapping("/blob")
    public ResponseEntity<Note> uploadFromBlob(
            @RequestParam("fileName") String fileName,
            @RequestParam("blobUrl") String blobUrl,
            @RequestParam("topicId") Long topicId) {

        try {
            if (fileName == null
                    || fileName.isBlank()
                    || !fileName.toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().build();
            }

            if (blobUrl == null || blobUrl.isBlank()) {
                return ResponseEntity.badRequest().build();
            }

            URI blobUri = URI.create(blobUrl);

            if (!"https".equalsIgnoreCase(blobUri.getScheme())
                    || blobUri.getHost() == null) {
                return ResponseEntity.badRequest().build();
            }

            Topic topic = topicRepository.findById(topicId).orElse(null);

            if (topic == null) {
                return ResponseEntity.notFound().build();
            }

            String safeFileName = Paths.get(fileName)
                    .getFileName()
                    .toString();

            Note note = new Note(
                    safeFileName,
                    blobUri.toString(),
                    topic);

            Note savedNote = noteService.createNote(note);

            ragIngestionService.ingestNote(savedNote.getId());

            return ResponseEntity.ok(savedNote);

        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // DELETE NOTE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {

        try {
            Note note = noteService.getNoteById(id).orElse(null);

            if (note == null) {
                return ResponseEntity.notFound().build();
            }

            int deletedVectorChunks =
                    ragIngestionService.deleteVectorsForNote(id);

            System.out.println(
                    "Deleted " + deletedVectorChunks
                            + " vector chunks for note " + id);

            String filePath = note.getFilePath();

            // Delete local files only, never attempt to delete a remote URL.
            if (filePath != null
                    && !filePath.startsWith("https://")
                    && !filePath.startsWith("http://")) {

                Path localFilePath = Paths.get(filePath);

                if (Files.exists(localFilePath)) {
                    Files.delete(localFilePath);
                }
            }

            noteService.deleteNote(id);

            return ResponseEntity.noContent().build();

        } catch (IOException | RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
