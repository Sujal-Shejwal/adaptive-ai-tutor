package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final ChatClient chatClient;
    private final RagSearchService ragSearchService;

    public GeminiService(
            ChatClient.Builder chatClientBuilder,
            RagSearchService ragSearchService) {

        this.chatClient =
                chatClientBuilder.build();

        this.ragSearchService =
                ragSearchService;
    }

    // =====================================================
    // SEND MESSAGE TO GEMINI USING RAG
    // =====================================================

    public String chat(
            String message) {

        if (
                message == null ||
                message.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Message cannot be empty"
            );
        }

        String question =
                message.trim();

        // -------------------------------------------------
        // 1. SEARCH RELEVANT COURSE MATERIAL
        // -------------------------------------------------

        List<Document> documents =
                ragSearchService.search(
                        question
                );

        // -------------------------------------------------
        // 2. BUILD COURSE CONTEXT
        // -------------------------------------------------

        String context =
                documents.stream()
                        .map(
                                Document::getText
                        )
                        .collect(
                                Collectors.joining(
                                        "\n\n--- COURSE CHUNK ---\n\n"
                                )
                        );

        // -------------------------------------------------
        // 3. BUILD RAG PROMPT
        // -------------------------------------------------

        String prompt;

        if (
                context == null ||
                context.isBlank()
        ) {

            prompt =
                    """
                    You are an AI tutor.

                    The student asked:
                    %s

                    No relevant content was found in
                    the uploaded course material.

                    Explain that the uploaded course material
                    does not contain enough information to
                    confidently answer this question.

                    Do not invent course-specific information.
                    """
                    .formatted(
                            question
                    );

        } else {

            prompt =
                    """
                    You are an AI tutor for a course.

                    Answer the student's question using
                    the uploaded course material provided below.

                    ==============================
                    UPLOADED COURSE MATERIAL
                    ==============================

                    %s

                    ==============================
                    STUDENT QUESTION
                    ==============================

                    %s

                    ==============================
                    INSTRUCTIONS
                    ==============================

                    1. Use the uploaded course material as
                       the primary source.

                    2. Give a clear and easy-to-understand
                       explanation.

                    3. Stay faithful to the course material.

                    4. Do not invent facts that are not
                       supported by the retrieved material.

                    5. You may organize the answer with
                       headings, bullets, examples, or
                       formulas when useful.

                    6. If the retrieved material does not
                       contain enough information to answer
                       the question, clearly say that the
                       uploaded course material does not
                       contain enough information.

                    7. Do not mention internal RAG,
                       embeddings, vector databases,
                       similarity search, or implementation
                       details to the student.

                    Now answer the student's question.
                    """
                    .formatted(
                            context,
                            question
                    );
        }

        // -------------------------------------------------
        // 4. SEND RAG PROMPT TO GEMINI
        // -------------------------------------------------

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}