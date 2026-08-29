package com.adaptiveaitutor.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.Note;
import com.adaptiveaitutor.backend.service.NoteService;
import com.adaptiveaitutor.backend.service.PdfTextExtractorService;

@RestController
@RequestMapping("/api/pdf")
public class PdfTextController {

    private final NoteService noteService;
    private final PdfTextExtractorService pdfTextExtractorService;

    public PdfTextController(
            NoteService noteService,
            PdfTextExtractorService pdfTextExtractorService) {

        this.noteService =
                noteService;

        this.pdfTextExtractorService =
                pdfTextExtractorService;
    }

    // =====================================================
    // EXTRACT TEXT FROM NOTE PDF
    // =====================================================

    @GetMapping("/text/{noteId}")
    public ResponseEntity<?> extractText(
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

            return ResponseEntity.ok(
                    text
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            exception.getMessage()
                    );
        }
    }
}