package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

@Service
public class RagAnswerService {

    private final RagSearchService ragSearchService;
    private final ChatClient chatClient;

    public RagAnswerService(
            RagSearchService ragSearchService,
            ChatClient.Builder chatClientBuilder) {

        this.ragSearchService =
                ragSearchService;

        this.chatClient =
                chatClientBuilder.build();
    }

    // =====================================================
    // ANSWER USING RETRIEVED PDF CONTEXT
    // =====================================================

    public String answer(
            String question) {

        if (
                question == null ||
                question.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Question cannot be empty"
            );
        }

        // -------------------------------------------------
        // 1. Search relevant PDF chunks
        // -------------------------------------------------

        List<Document> documents =
                ragSearchService.search(
                        question
                );

        // -------------------------------------------------
        // 2. Build context
        // -------------------------------------------------

        String context =
                documents.stream()
                        .map(
                                Document::getText
                        )
                        .collect(
                                Collectors.joining(
                                        "\n\n---\n\n"
                                )
                        );

        // -------------------------------------------------
        // 3. Prompt Gemini with context
        // -------------------------------------------------

        String prompt =
                """
                You are an AI tutor.

                Answer the student's question using
                the provided course material.

                Course material:
                %s

                Student question:
                %s

                Instructions:
                - Use the course material as the primary source.
                - Explain the answer clearly.
                - Do not invent information that is not supported
                  by the course material.
                - If the answer is not available in the material,
                  say that the uploaded course material does not
                  contain enough information.
                """
                .formatted(
                        context,
                        question
                );

        // -------------------------------------------------
        // 4. Ask Gemini
        // -------------------------------------------------

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}