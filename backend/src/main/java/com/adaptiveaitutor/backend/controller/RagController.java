package com.adaptiveaitutor.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.service.RagIngestionService;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final RagIngestionService ragIngestionService;

    public RagController(
            RagIngestionService ragIngestionService) {

        this.ragIngestionService =
                ragIngestionService;
    }

    // =====================================================
    // INGEST PDF INTO PGVECTOR
    // =====================================================

    @GetMapping("/ingest/{noteId}")
    public ResponseEntity<?> ingest(
            @PathVariable Long noteId) {

        try {

            Map<String, Object> result =
                    ragIngestionService
                            .ingestNote(noteId);

            return ResponseEntity.ok(
                    result
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }
}