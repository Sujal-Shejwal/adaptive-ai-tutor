package com.adaptiveaitutor.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.Note;
import com.adaptiveaitutor.backend.service.NoteService;
import com.adaptiveaitutor.backend.service.PdfTextExtractorService;
import com.adaptiveaitutor.backend.service.TextChunkingService;

@RestController
@RequestMapping("/api/pdf")
public class PdfChunkController {

    private final NoteService noteService;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final TextChunkingService textChunkingService;

    public PdfChunkController(
            NoteService noteService,
            PdfTextExtractorService pdfTextExtractorService,
            TextChunkingService textChunkingService) {

        this.noteService =
                noteService;

        this.pdfTextExtractorService =
                pdfTextExtractorService;

        this.textChunkingService =
                textChunkingService;
    }

    // =====================================================
    // GET PDF CHUNKS
    // =====================================================

    @GetMapping("/chunks/{noteId}")
    public ResponseEntity<?> getChunks(
            @PathVariable Long noteId) {

        try {

            Note note =
                    noteService
                            .getNoteById(noteId)
                            .orElse(null);

            if (note == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            String text =
                    pdfTextExtractorService
                            .extractText(
                                    note.getFilePath()
                            );

            List<String> chunks =
                    textChunkingService
                            .chunkText(text);

            return ResponseEntity.ok(
                    Map.of(
                            "noteId", noteId,
                            "fileName", note.getFileName(),
                            "totalChunks", chunks.size(),
                            "chunks", chunks
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }
}