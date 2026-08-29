package com.adaptiveaitutor.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.ai.document.Document;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.service.RagSearchService;

@RestController
@RequestMapping("/api/rag")
public class RagSearchController {

    private final RagSearchService ragSearchService;

    public RagSearchController(
            RagSearchService ragSearchService) {

        this.ragSearchService =
                ragSearchService;
    }

    // =====================================================
    // SEARCH VECTOR STORE
    // =====================================================

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam String query) {

        try {

            List<Document> documents =
                    ragSearchService
                            .search(query);

            List<Map<String, Object>> results =
                    documents.stream()
                            .map(
                                    document ->
                                            Map.of(
                                                    "content",
                                                    document.getText(),
                                                    "metadata",
                                                    document.getMetadata()
                                            )
                            )
                            .toList();

            return ResponseEntity.ok(
                    Map.of(
                            "query",
                            query,
                            "count",
                            results.size(),
                            "results",
                            results
                    )
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