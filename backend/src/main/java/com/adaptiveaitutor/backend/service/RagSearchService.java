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
            LoggerFactory.getLogger(RagSearchService.class);

    private final VectorStore vectorStore;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RagSearchService(
            VectorStore vectorStore) {

        this.vectorStore =
                vectorStore;
    }

    // =====================================================
    // SEARCH
    // =====================================================

    public List<Document> search(
            String query) {

        if (
                query == null ||
                query.isBlank()
        ) {

            return List.of();
        }

        String cleanQuery =
                query.trim();

        // -------------------------------------------------
        // SEARCH PGVECTOR
        // -------------------------------------------------

        SearchRequest request =
                SearchRequest
                        .builder()
                        .query(cleanQuery)
                        .topK(5)
                        .similarityThreshold(0.0)
                        .build();

        List<Document> documents;

        try {

            documents =
                    vectorStore.similaritySearch(
                            request
                    );

        } catch (Exception exception) {

            logger.error(
                    "RAG search failed for query: {}",
                    cleanQuery,
                    exception
            );

            return List.of();
        }

        // -------------------------------------------------
        // NO RESULTS
        // -------------------------------------------------

        if (
                documents == null ||
                documents.isEmpty()
        ) {

            logger.warn(
                    "No documents returned from PGVector for query: {}",
                    cleanQuery
            );

            return List.of();
        }

        // -------------------------------------------------
        // DEBUG INFORMATION
        // -------------------------------------------------

        logger.info(
                "PGVector returned {} documents for query: {}",
                documents.size(),
                cleanQuery
        );

        for (
                int i = 0;
                i < documents.size();
                i++
        ) {

            Document document =
                    documents.get(i);

            if (document == null) {
                continue;
            }

            Map<String, Object> metadata =
                    document.getMetadata();

            logger.info(
                    "RAG Document {} metadata: {}",
                    i + 1,
                    metadata
            );
        }

        // -------------------------------------------------
        // FILTER VALID DOCUMENTS
        // -------------------------------------------------

        List<Document> validDocuments =
                documents.stream()
                        .filter(
                                document ->
                                        document != null
                                                &&
                                        document.getText() != null
                                                &&
                                        !document
                                                .getText()
                                                .isBlank()
                        )
                        .collect(
                                Collectors.toList()
                        );

        // -------------------------------------------------
        // FALLBACK
        // -------------------------------------------------

        if (
                validDocuments.isEmpty()
        ) {

            logger.warn(
                    "PGVector returned documents, but none contained usable text."
            );

            return List.of();
        }

        // -------------------------------------------------
        // RETURN RESULTS
        // -------------------------------------------------

        return validDocuments;
    }
}