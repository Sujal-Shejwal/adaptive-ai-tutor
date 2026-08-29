package com.adaptiveaitutor.backend.service;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class RagSearchService {

    private final VectorStore vectorStore;

    public RagSearchService(
            VectorStore vectorStore) {

        this.vectorStore =
                vectorStore;
    }

    // =====================================================
    // SEARCH RELEVANT DOCUMENTS
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

        return vectorStore
                .similaritySearch(request);
    }
}