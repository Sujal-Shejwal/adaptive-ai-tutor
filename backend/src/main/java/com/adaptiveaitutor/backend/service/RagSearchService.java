package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class RagSearchService {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    RagSearchService.class
            );

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

        // -------------------------------------------------
        // VALIDATE QUERY
        // -------------------------------------------------

        if (
                query == null ||
                query.isBlank()
        ) {

            return List.of();
        }

        String cleanQuery =
                query.trim();

        // -------------------------------------------------
        // BUILD SEARCH REQUEST
        // -------------------------------------------------

        SearchRequest request =
                SearchRequest
                        .builder()
                        .query(cleanQuery)
                        .topK(5)
                        .similarityThreshold(0.0)
                        .build();

        // -------------------------------------------------
        // PERFORM VECTOR SEARCH
        // -------------------------------------------------

        List<Document> documents;

        try {

            documents =
                    vectorStore.similaritySearch(
                            request
                    );

        } catch (Exception exception) {

            // -------------------------------------------------
            // RAG / EMBEDDING FAILURE
            // -------------------------------------------------
            //
            // Example:
            //
            // Gemini embedding API returns HTTP 429
            // because the embedding quota was exceeded.
            //
            // We do NOT fail the complete AI chat request.
            //
            // Returning an empty list allows GeminiService
            // to use its general-knowledge fallback.
            // -------------------------------------------------

            logger.warn(
                    "RAG search failed for query: '{}'. "
                    + "Continuing without course-material context.",
                    cleanQuery,
                    exception
            );

            return List.of();
        }

        // -------------------------------------------------
        // HANDLE EMPTY SEARCH RESULT
        // -------------------------------------------------

        if (
                documents == null ||
                documents.isEmpty()
        ) {

            return List.of();
        }

        // -------------------------------------------------
        // FILTER USING PGVECTOR DISTANCE
        // -------------------------------------------------

        return documents.stream()
                .filter(
                        document -> {

                            if (document == null) {
                                return false;
                            }

                            Map<String, Object> metadata =
                                    document.getMetadata();

                            if (metadata == null) {
                                return false;
                            }

                            Object distanceValue =
                                    metadata.get(
                                            "distance"
                                    );

                            if (
                                    distanceValue == null
                            ) {

                                return false;
                            }

                            try {

                                double distance =
                                        Double.parseDouble(
                                                distanceValue
                                                        .toString()
                                        );

                                return distance <=
                                        MAX_DISTANCE;

                            } catch (
                                    NumberFormatException exception
                            ) {

                                logger.warn(
                                        "Invalid PGVector "
                                        + "distance value: {}",
                                        distanceValue
                                );

                                return false;
                            }
                        }
                )
                .collect(
                        Collectors.toList()
                );
    }
}