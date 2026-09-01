package com.adaptiveaitutor.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.ChatMessage;
import com.adaptiveaitutor.backend.service.ConversationService;
import com.adaptiveaitutor.backend.service.GeminiService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    private final GeminiService geminiService;
    private final ConversationService conversationService;

    // =====================================================
    // HISTORY LIMITS
    // =====================================================

    private static final int MAX_HISTORY_MESSAGES = 10;

    private static final int MAX_HISTORY_CHARACTERS = 12000;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AIController(
            GeminiService geminiService,
            ConversationService conversationService) {

        this.geminiService =
                geminiService;

        this.conversationService =
                conversationService;
    }

    // =====================================================
    // AI CHAT
    // =====================================================

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
            @RequestBody ChatRequest request) {

        try {

            // ---------------------------------------------
            // VALIDATE REQUEST
            // ---------------------------------------------

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Request cannot be empty."
                                )
                        );
            }

            if (
                    request.getConversationId() == null
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Conversation ID is required."
                                )
                        );
            }

            if (
                    request.getMessage() == null ||
                    request.getMessage()
                            .trim()
                            .isEmpty()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Message cannot be empty."
                                )
                        );
            }

            // ---------------------------------------------
            // VERIFY CONVERSATION
            // ---------------------------------------------

            conversationService
                    .getConversationById(
                            request.getConversationId()
                    );

            String userMessage =
                    request
                            .getMessage()
                            .trim();

            // ---------------------------------------------
            // LOAD CONVERSATION HISTORY
            // ---------------------------------------------

            List<ChatMessage> allMessages =
                    conversationService
                            .getMessages(
                                    request.getConversationId()
                            );

            List<ChatMessage> recentMessages =
                    getRecentMessages(
                            allMessages
                    );

            // ---------------------------------------------
            // GENERATE AI RESPONSE FIRST
            // ---------------------------------------------

            String reply;

            try {

                reply =
                        geminiService.chat(
                                userMessage,
                                recentMessages
                        );

            } catch (Exception exception) {

                exception.printStackTrace();

                return ResponseEntity
                        .status(503)
                        .body(
                                new MessageResponse(
                                        "AI service is temporarily unavailable. "
                                        + "Please try again."
                                )
                        );
            }

            // ---------------------------------------------
            // VALIDATE AI RESPONSE
            // ---------------------------------------------

            if (
                    reply == null ||
                    reply.isBlank()
            ) {

                return ResponseEntity
                        .status(503)
                        .body(
                                new MessageResponse(
                                        "AI returned an empty response."
                                )
                        );
            }

            // ---------------------------------------------
            // SAVE USER MESSAGE
            // ---------------------------------------------

            ChatMessage savedUserMessage =
                    conversationService.addMessage(
                            request.getConversationId(),
                            "user",
                            userMessage
                    );

            // ---------------------------------------------
            // SAVE ASSISTANT MESSAGE
            // ---------------------------------------------

            ChatMessage savedAssistantMessage;

            try {

                savedAssistantMessage =
                        conversationService.addMessage(
                                request.getConversationId(),
                                "assistant",
                                reply
                        );

            } catch (RuntimeException exception) {

                exception.printStackTrace();

                return ResponseEntity
                        .internalServerError()
                        .body(
                                new MessageResponse(
                                        "AI responded, but the response "
                                        + "could not be saved."
                                )
                        );
            }

            // ---------------------------------------------
            // RETURN RESPONSE
            // ---------------------------------------------

            return ResponseEntity.ok(
                    new ChatResponse(
                            reply,
                            savedUserMessage.getId(),
                            savedAssistantMessage.getId()
                    )
            );

        } catch (RuntimeException exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            new MessageResponse(
                                    exception.getMessage() != null
                                            ? exception.getMessage()
                                            : "AI request failed."
                            )
                    );
        }
    }

    // =====================================================
    // SAFE AI REGENERATION
    // =====================================================

    @PutMapping(
            "/regenerate/{conversationId}/{messageId}"
    )
    public ResponseEntity<?> regenerateMessage(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @RequestBody UpdateMessageRequest request) {

        try {

            // ---------------------------------------------
            // VALIDATE REQUEST
            // ---------------------------------------------

            if (
                    request == null ||
                    request.getContent() == null ||
                    request.getContent().isBlank()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Message content cannot be empty."
                                )
                        );
            }

            String editedContent =
                    request
                            .getContent()
                            .trim();

            // ---------------------------------------------
            // VERIFY TARGET MESSAGE
            // ---------------------------------------------

            ChatMessage targetMessage =
                    conversationService
                            .getMessageForConversation(
                                    conversationId,
                                    messageId
                            );

            // ---------------------------------------------
            // LOAD HISTORY BEFORE EDITED MESSAGE
            // ---------------------------------------------

            List<ChatMessage> history =
                    conversationService
                            .getHistoryBeforeMessage(
                                    conversationId,
                                    messageId
                            );

            // ---------------------------------------------
            // APPLY HISTORY LIMITS
            // ---------------------------------------------

            history =
                    getRecentMessages(
                            history
                    );

            // ---------------------------------------------
            // GENERATE NEW AI RESPONSE
            // ---------------------------------------------

            String reply;

            try {

                reply =
                        geminiService.chat(
                                editedContent,
                                history
                        );

            } catch (Exception exception) {

                exception.printStackTrace();

                return ResponseEntity
                        .status(503)
                        .body(
                                new MessageResponse(
                                        "AI service is temporarily unavailable. "
                                        + "Your original conversation was not changed."
                                )
                        );
            }

            // ---------------------------------------------
            // VALIDATE AI RESPONSE
            // ---------------------------------------------

            if (
                    reply == null ||
                    reply.isBlank()
            ) {

                return ResponseEntity
                        .status(503)
                        .body(
                                new MessageResponse(
                                        "AI returned an empty response. "
                                        + "Your original conversation was not changed."
                                )
                        );
            }

            // ---------------------------------------------
            // APPLY DATABASE CHANGES ONLY AFTER AI SUCCESS
            // ---------------------------------------------

            ConversationService.RegenerationResult result =
                    conversationService
                            .completeMessageRegeneration(
                                    conversationId,
                                    targetMessage.getId(),
                                    editedContent,
                                    reply
                            );

            // ---------------------------------------------
            // RETURN RESPONSE
            // ---------------------------------------------

            return ResponseEntity.ok(
                    new RegenerateResponse(
                            result.getUserMessage(),
                            result.getAssistantMessage()
                    )
            );

        } catch (RuntimeException exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            new MessageResponse(
                                    exception.getMessage() != null
                                            ? exception.getMessage()
                                            : "Unable to regenerate AI response."
                            )
                    );
        }
    }

    // =====================================================
    // GET RECENT MESSAGES
    // =====================================================
    //
    // Applies TWO limits:
    //
    // 1. Maximum number of messages
    // 2. Maximum total characters
    //
    // Messages are selected from newest to oldest so the
    // most recent context is preserved.
    //
    // =====================================================

    private List<ChatMessage> getRecentMessages(
            List<ChatMessage> messages) {

        if (
                messages == null ||
                messages.isEmpty()
        ) {

            return List.of();
        }

        List<ChatMessage> selectedMessages =
                new ArrayList<>();

        int totalCharacters = 0;

        // ---------------------------------------------
        // START FROM MOST RECENT MESSAGE
        // ---------------------------------------------

        for (
                int i = messages.size() - 1;
                i >= 0;
                i--
        ) {

            ChatMessage message =
                    messages.get(i);

            if (
                    message == null ||
                    message.getContent() == null ||
                    message.getContent().isBlank()
            ) {

                continue;
            }

            int messageCharacters =
                    message.getContent()
                            .length();

            // -----------------------------------------
            // MESSAGE COUNT LIMIT
            // -----------------------------------------

            if (
                    selectedMessages.size()
                            >= MAX_HISTORY_MESSAGES
            ) {

                break;
            }

            // -----------------------------------------
            // CHARACTER LIMIT
            // -----------------------------------------

            if (
                    totalCharacters
                            + messageCharacters
                            >
                    MAX_HISTORY_CHARACTERS
            ) {

                // -------------------------------------
                // IF NOTHING HAS BEEN SELECTED YET,
                // KEEP A TRUNCATED VERSION OF THE
                // MOST RECENT MESSAGE.
                // -------------------------------------

                if (
                        selectedMessages.isEmpty()
                ) {

                    String truncatedContent =
                            message.getContent()
                                    .substring(
                                            0,
                                            Math.min(
                                                    MAX_HISTORY_CHARACTERS,
                                                    messageCharacters
                                            )
                                    );

                    ChatMessage truncatedMessage =
                            new ChatMessage(
                                    message.getRole(),
                                    truncatedContent
                            );

                    selectedMessages.add(
                            truncatedMessage
                    );
                }

                break;
            }

            selectedMessages.add(
                    message
            );

            totalCharacters +=
                    messageCharacters;
        }

        // ---------------------------------------------
        // REVERSE BACK TO OLD → NEW ORDER
        // ---------------------------------------------

        java.util.Collections.reverse(
                selectedMessages
        );

        // ---------------------------------------------
        // HISTORY DIAGNOSTICS
        // ---------------------------------------------
        //
        // Temporary diagnostic output for Day 27.
        //
        // This lets us verify exactly how much history
        // is being passed to Gemini.
        //
        // ---------------------------------------------

        int finalCharacterCount =
                selectedMessages.stream()
                        .mapToInt(
                                message ->
                                        message.getContent() == null
                                                ? 0
                                                : message.getContent()
                                                        .length()
                        )
                        .sum();

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "AI CONVERSATION HISTORY"
        );

        System.out.println(
                "Messages sent to Gemini: "
                        + selectedMessages.size()
        );

        System.out.println(
                "Characters sent to Gemini: "
                        + finalCharacterCount
        );

        System.out.println(
                "Maximum messages: "
                        + MAX_HISTORY_MESSAGES
        );

        System.out.println(
                "Maximum characters: "
                        + MAX_HISTORY_CHARACTERS
        );

        System.out.println(
                "=========================================="
        );

        return selectedMessages;
    }

    // =====================================================
    // CHAT REQUEST
    // =====================================================

    public static class ChatRequest {

        private Long conversationId;

        private String message;

        public ChatRequest() {
        }

        public Long getConversationId() {
            return conversationId;
        }

        public void setConversationId(
                Long conversationId) {

            this.conversationId =
                    conversationId;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(
                String message) {

            this.message =
                    message;
        }
    }

    // =====================================================
    // UPDATE MESSAGE REQUEST
    // =====================================================

    public static class UpdateMessageRequest {

        private String content;

        public UpdateMessageRequest() {
        }

        public String getContent() {
            return content;
        }

        public void setContent(
                String content) {

            this.content =
                    content;
        }
    }

    // =====================================================
    // CHAT RESPONSE
    // =====================================================

    public static class ChatResponse {

        private String reply;

        private Long userMessageId;

        private Long assistantMessageId;

        public ChatResponse(
                String reply,
                Long userMessageId,
                Long assistantMessageId) {

            this.reply =
                    reply;

            this.userMessageId =
                    userMessageId;

            this.assistantMessageId =
                    assistantMessageId;
        }

        public String getReply() {
            return reply;
        }

        public Long getUserMessageId() {
            return userMessageId;
        }

        public Long getAssistantMessageId() {
            return assistantMessageId;
        }
    }

    // =====================================================
    // REGENERATE RESPONSE
    // =====================================================

    public static class RegenerateResponse {

        private ChatMessage userMessage;

        private ChatMessage assistantMessage;

        public RegenerateResponse(
                ChatMessage userMessage,
                ChatMessage assistantMessage) {

            this.userMessage =
                    userMessage;

            this.assistantMessage =
                    assistantMessage;
        }

        public ChatMessage getUserMessage() {
            return userMessage;
        }

        public ChatMessage getAssistantMessage() {
            return assistantMessage;
        }
    }

    // =====================================================
    // MESSAGE RESPONSE
    // =====================================================

    public static class MessageResponse {

        private String message;

        public MessageResponse(
                String message) {

            this.message =
                    message;
        }

        public String getMessage() {
            return message;
        }
    }
}