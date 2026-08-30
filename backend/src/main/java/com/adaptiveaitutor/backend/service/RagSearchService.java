package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class RagSearchService {

    private final VectorStore vectorStore;

    // Lower distance = more similar
    private static final double MAX_DISTANCE = 0.45;

    public RagSearchService(
            VectorStore vectorStore) {

        this.vectorStore =
                vectorStore;
    }

    // =====================================================
    // SEARCH RELEVANT COURSE MATERIAL
    // =====================================================

    public List<Document> search(
            String query) {

        if (
                query == null ||
                query.isBlank()
        ) {
            return List.of();
        }

        SearchRequest request =
                SearchRequest
                        .builder()
                        .query(query.trim())
                        .topK(5)
                        .similarityThreshold(0.0)
                        .build();

        List<Document> documents =
                vectorStore.similaritySearch(
                        request
                );

        // -------------------------------------------------
        // FILTER USING PGVECTOR DISTANCE
        // -------------------------------------------------

        return documents.stream()
                .filter(document -> {

                    Map<String, Object> metadata =
                            document.getMetadata();

                    Object distanceValue =
                            metadata.get("distance");

                    if (distanceValue == null) {
                        return false;
                    }

                    double distance =
                            Double.parseDouble(
                                    distanceValue.toString()
                            );

                    return distance <= MAX_DISTANCE;
                })
                .collect(Collectors.toList());
    }
}