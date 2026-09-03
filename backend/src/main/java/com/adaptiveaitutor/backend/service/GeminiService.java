package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.ChatMessage;

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
    // NORMAL CHAT
    // =====================================================

    public String chat(
            String message,
            List<ChatMessage> history) {

        return chat(
                message,
                history,
                null
        );
    }

    // =====================================================
    // ADAPTIVE CHAT
    // =====================================================

    public String chat(
            String message,
            List<ChatMessage> history,
            String adaptiveContext) {

        // -------------------------------------------------
        // VALIDATE MESSAGE
        // -------------------------------------------------

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
        // 2. BUILD COURSE CONTEXT
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
        // 3. BUILD CONVERSATION HISTORY
        // -------------------------------------------------

        String conversationHistory =
                buildConversationHistory(
                        history
                );

        // -------------------------------------------------
        // 4. BUILD ADAPTIVE SECTION
        // -------------------------------------------------

        String adaptiveSection =
                "";

        if (
                adaptiveContext != null &&
                !adaptiveContext.isBlank()
        ) {

            adaptiveSection =
                    """

                    ==============================
                    STUDENT ADAPTIVE PROFILE
                    ==============================

                    %s

                    ==============================
                    END ADAPTIVE PROFILE
                    ==============================

                    """
                    .formatted(
                            adaptiveContext
                    );
        }

        // =================================================
        // 5. BUILD PROMPT
        // =================================================

        String prompt;

        if (
                context == null ||
                context.isBlank()
        ) {

            // ---------------------------------------------
            // NO COURSE MATERIAL
            // ---------------------------------------------

            prompt =
                    """
                    You are an AI tutor.

                    You are having an ongoing conversation
                    with a student.

                    %s

                    ==============================
                    PREVIOUS CONVERSATION
                    ==============================

                    %s

                    ==============================
                    CURRENT QUESTION
                    ==============================

                    %s

                    ==============================
                    INSTRUCTIONS
                    ==============================

                    Use the previous conversation to
                    understand the student's current question.

                    Maintain conversational continuity.

                    Resolve references such as:

                    "it"
                    "this"
                    "that"
                    "they"
                    "its"
                    "the above"
                    "the previous concept"
                    "that example"

                    based on the previous conversation.

                    Answer the current question directly.

                    No relevant information was found
                    in the student's uploaded course material.

                    Use your general knowledge when answering.

                    Be accurate, clear, and helpful.

                    Do not claim that the answer came from
                    the uploaded course material.

                    Do not mention RAG, embeddings,
                    vector databases, similarity search,
                    or internal implementation details.

                    Answer naturally like a helpful tutor.
                    """
                    .formatted(
                            adaptiveSection,
                            conversationHistory,
                            question
                    );

        } else {

            // ---------------------------------------------
            // COURSE MATERIAL FOUND
            // ---------------------------------------------

            prompt =
                    """
                    You are an AI tutor.

                    You are having an ongoing conversation
                    with a student.

                    %s

                    ==============================
                    PREVIOUS CONVERSATION
                    ==============================

                    %s

                    ==============================
                    CURRENT QUESTION
                    ==============================

                    %s

                    ==============================
                    RELEVANT COURSE MATERIAL
                    ==============================

                    %s

                    ==============================
                    INSTRUCTIONS
                    ==============================

                    Use the previous conversation to
                    understand the student's current question.

                    Maintain conversational continuity.

                    Resolve references such as:

                    "it"
                    "this"
                    "that"
                    "they"
                    "its"
                    "the above"
                    "the previous concept"
                    "that example"

                    using the previous conversation.

                    Use the relevant course material as the
                    primary source when answering.

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

                    Apply the student's adaptive learning
                    profile when one is provided.

                    Answer naturally like a helpful tutor.
                    """
                    .formatted(
                            adaptiveSection,
                            conversationHistory,
                            question,
                            context
                    );
        }

        // -------------------------------------------------
        // 6. SEND TO GEMINI
        // -------------------------------------------------

        String response =
                chatClient
                        .prompt()
                        .user(prompt)
                        .call()
                        .content();

        // -------------------------------------------------
        // 7. VALIDATE RESPONSE
        // -------------------------------------------------

        if (
                response == null ||
                response.isBlank()
        ) {

            throw new RuntimeException(
                    "AI returned an empty response."
            );
        }

        return response.trim();
    }

    // =====================================================
    // BUILD CONVERSATION HISTORY
    // =====================================================

    private String buildConversationHistory(
            List<ChatMessage> history) {

        if (
                history == null ||
                history.isEmpty()
        ) {

            return "No previous conversation.";
        }

        return history.stream()
                .filter(
                        chatMessage ->
                                chatMessage != null &&
                                chatMessage.getContent() != null &&
                                !chatMessage
                                        .getContent()
                                        .isBlank()
                )
                .map(
                        chatMessage -> {

                            String role =
                                    chatMessage.getRole();

                            String content =
                                    chatMessage
                                            .getContent()
                                            .trim();

                            if (
                                    "user".equalsIgnoreCase(
                                            role
                                    )
                            ) {

                                return
                                        "--- Previous Turn ---\n"
                                        +
                                        "Student: "
                                        +
                                        content;

                            }

                            if (
                                    "assistant".equalsIgnoreCase(
                                            role
                                    )
                            ) {

                                return
                                        "Tutor: "
                                        +
                                        content;
                            }

                            return
                                    "--- Previous Turn ---\n"
                                    +
                                    "Message: "
                                    +
                                    content;
                        }
                )
                .collect(
                        Collectors.joining(
                                "\n\n"
                        )
                );
    }

    // =====================================================
    // BACKWARD-COMPATIBLE CHAT METHOD
    // =====================================================

    public String chat(
            String message) {

        return chat(
                message,
                List.of()
        );
    }
}