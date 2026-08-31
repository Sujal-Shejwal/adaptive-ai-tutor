package com.adaptiveaitutor.backend.controller;

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
            // SAVE USER MESSAGE
            // ---------------------------------------------

            conversationService.addMessage(
                    request.getConversationId(),
                    "user",
                    userMessage
            );

            // ---------------------------------------------
            // SEND TO GEMINI + RAG
            // ---------------------------------------------

            String reply =
                    geminiService.chat(
                            userMessage
                    );

            // ---------------------------------------------
            // SAVE AI MESSAGE
            // ---------------------------------------------

            conversationService.addMessage(
                    request.getConversationId(),
                    "assistant",
                    reply
            );

            // ---------------------------------------------
            // RETURN RESPONSE
            // ---------------------------------------------

            return ResponseEntity.ok(
                    new ChatResponse(
                            reply
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
    // REGENERATE AI RESPONSE AFTER MESSAGE EDIT
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

            // ---------------------------------------------
            // UPDATE MESSAGE + DELETE OLD ANSWERS
            // ---------------------------------------------

            ChatMessage updatedMessage =
                    conversationService
                            .prepareMessageRegeneration(
                                    conversationId,
                                    messageId,
                                    request.getContent()
                            );

            // ---------------------------------------------
            // GENERATE NEW AI RESPONSE
            // ---------------------------------------------

            String reply =
                    geminiService.chat(
                            updatedMessage.getContent()
                    );

            if (
                    reply == null ||
                    reply.isBlank()
            ) {

                throw new RuntimeException(
                        "AI returned an empty response."
                );
            }

            // ---------------------------------------------
            // SAVE NEW AI MESSAGE
            // ---------------------------------------------

            ChatMessage assistantMessage =
                    conversationService.addMessage(
                            conversationId,
                            "assistant",
                            reply
                    );

            // ---------------------------------------------
            // RETURN RESPONSE
            // ---------------------------------------------

            return ResponseEntity.ok(
                    new RegenerateResponse(
                            updatedMessage,
                            assistantMessage
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

        public ChatResponse(
                String reply) {

            this.reply =
                    reply;
        }

        public String getReply() {
            return reply;
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