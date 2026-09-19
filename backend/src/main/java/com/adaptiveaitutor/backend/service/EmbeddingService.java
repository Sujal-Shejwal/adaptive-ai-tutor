package com.adaptiveaitutor.backend.service;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

@Service
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;

    public EmbeddingService(
            EmbeddingModel embeddingModel) {

        this.embeddingModel =
                embeddingModel;
    }

    // =====================================================
    // CREATE EMBEDDING FOR ONE TEXT CHUNK
    // =====================================================

    public float[] createEmbedding(
            String text) {

        if (
                text == null ||
                text.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Text cannot be empty"
            );
        }

        Document document =
                new Document(
                        text.trim()
                );

        return embeddingModel
                .embed(document);
    }

    // =====================================================
    // CREATE EMBEDDINGS FOR MULTIPLE CHUNKS
    // =====================================================

    public List<float[]> createEmbeddings(
            List<String> chunks) {

        if (
                chunks == null ||
                chunks.isEmpty()
        ) {
            return List.of();
        }

        return chunks.stream()
                .filter(
                        chunk ->
                                chunk != null &&
                                !chunk.isBlank()
                )
                .map(
                        this::createEmbedding
                )
                .toList();
    }
}