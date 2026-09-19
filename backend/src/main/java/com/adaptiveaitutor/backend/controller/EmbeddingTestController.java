package com.adaptiveaitutor.backend.controller;

import java.util.Map;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/embeddings")
public class EmbeddingTestController {

    private final EmbeddingModel embeddingModel;

    public EmbeddingTestController(
            EmbeddingModel embeddingModel) {

        this.embeddingModel =
                embeddingModel;
    }

    // =====================================================
    // TEST EMBEDDING
    // =====================================================

    @GetMapping("/test")
    public Map<String, Object> testEmbedding(
            @RequestParam String text) {

        if (
                text == null ||
                text.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Text cannot be empty"
            );
        }

        float[] embedding =
                embeddingModel.embed(
                        text
                );

        return Map.of(
                "text",
                text,
                "dimensions",
                embedding.length,
                "embedding",
                embedding
        );
    }
}