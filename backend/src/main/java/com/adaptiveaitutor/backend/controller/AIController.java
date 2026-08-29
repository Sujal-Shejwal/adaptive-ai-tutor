package com.adaptiveaitutor.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.service.GeminiService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    private final GeminiService geminiService;

    public AIController(
            GeminiService geminiService) {

        this.geminiService =
                geminiService;
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

            if (
                    request == null ||
                    request.getMessage() == null ||
                    request.getMessage().trim().isEmpty()
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
            // SEND MESSAGE TO GEMINI + RAG
            // ---------------------------------------------

            String reply =
                    geminiService.chat(
                            request.getMessage()
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
    // CHAT REQUEST
    // =====================================================

    public static class ChatRequest {

        private String message;

        public ChatRequest() {
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