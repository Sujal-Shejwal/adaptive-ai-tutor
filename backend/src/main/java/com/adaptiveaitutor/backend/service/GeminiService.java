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
    // SEND MESSAGE TO GEMINI
    // WITH RAG + GENERAL KNOWLEDGE FALLBACK
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
        // 1. SEARCH COURSE MATERIAL
        // -------------------------------------------------

        List<Document> documents =
                ragSearchService.search(
                        question
                );

        // -------------------------------------------------
        // 2. BUILD CONTEXT
        // -------------------------------------------------

        String context =
                documents.stream()
                        .map(
                                Document::getText
                        )
                        .collect(
                                Collectors.joining(
                                        "\n\n--- COURSE MATERIAL ---\n\n"
                                )
                        );

        // -------------------------------------------------
        // 3. BUILD PROMPT
        // -------------------------------------------------

        String prompt;

        if (
                context == null ||
                context.isBlank()
        ) {

            // ---------------------------------------------
            // NO RELEVANT COURSE MATERIAL
            // ---------------------------------------------

            prompt =
                    """
                    You are an AI tutor.

                    The student asked:

                    %s

                    No relevant information was found
                    in the student's uploaded course material.

                    Answer the student's question using
                    your general knowledge.

                    Be accurate, clear, and helpful.

                    Do not claim that the answer came from
                    the uploaded course material.

                    Do not mention RAG, embeddings,
                    vector databases, or internal systems.
                    """
                    .formatted(
                            question
                    );

        } else {

            // ---------------------------------------------
            // RELEVANT COURSE MATERIAL FOUND
            // ---------------------------------------------

            prompt =
                    """
                    You are an AI tutor.

                    The student asked:

                    %s


                    ==============================
                    RELEVANT COURSE MATERIAL
                    ==============================

                    %s


                    ==============================
                    INSTRUCTIONS
                    ==============================

                    Use the relevant course material as
                    the primary source when answering.

                    Explain the answer clearly and simply.

                    You may also use your general knowledge
                    when it helps explain the topic.

                    Do not contradict the course material.

                    If you add information from general
                    knowledge, do not present it as though
                    it came from the uploaded material.

                    Do not mention RAG, embeddings,
                    vector databases, similarity search,
                    or internal implementation details.

                    Answer naturally like a helpful tutor.
                    """
                    .formatted(
                            question,
                            context
                    );
        }

        // -------------------------------------------------
        // 4. SEND TO GEMINI
        // -------------------------------------------------

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}