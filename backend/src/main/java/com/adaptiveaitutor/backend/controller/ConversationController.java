package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.ChatMessage;
import com.adaptiveaitutor.backend.entity.Conversation;
import com.adaptiveaitutor.backend.service.ConversationService;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(
            ConversationService conversationService) {

        this.conversationService =
                conversationService;
    }

    // =====================================================
    // GET ALL CONVERSATIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Conversation>>
    getAllConversations() {

        return ResponseEntity.ok(
                conversationService
                        .getAllConversations()
        );
    }

    // =====================================================
    // GET CONVERSATION BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Conversation>
    getConversation(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    conversationService
                            .getConversationById(id)
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // GET MESSAGES OF CONVERSATION
    // =====================================================

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ChatMessage>>
    getMessages(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    conversationService
                            .getMessages(id)
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // CREATE CONVERSATION
    // =====================================================

    @PostMapping
    public ResponseEntity<Conversation>
    createConversation(
            @RequestBody CreateConversationRequest request) {

        try {

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            Conversation conversation =
                    conversationService
                            .createConversation(
                                    request.getTitle(),
                                    request.getSubject()
                            );

            return ResponseEntity
                    .ok(conversation);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // =====================================================
    // ADD MESSAGE
    // =====================================================

    @PostMapping("/{id}/messages")
    public ResponseEntity<ChatMessage>
    addMessage(
            @PathVariable Long id,
            @RequestBody AddMessageRequest request) {

        try {

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            ChatMessage message =
                    conversationService.addMessage(
                            id,
                            request.getRole(),
                            request.getContent()
                    );

            return ResponseEntity
                    .ok(message);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // =====================================================
    // UPDATE MESSAGE
    // =====================================================

    @PutMapping("/message/{messageId}")
    public ResponseEntity<ChatMessage>
    updateMessage(
            @PathVariable Long messageId,
            @RequestBody UpdateMessageRequest request) {

        try {

            if (
                    request == null ||
                    request.getContent() == null ||
                    request.getContent().isBlank()
            ) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            ChatMessage updatedMessage =
                    conversationService.updateMessage(
                            messageId,
                            request.getContent()
                    );

            return ResponseEntity.ok(
                    updatedMessage
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // UPDATE CONVERSATION TITLE
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Conversation>
    updateConversationTitle(
            @PathVariable Long id,
            @RequestBody UpdateConversationRequest request) {

        try {

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            Conversation conversation =
                    conversationService
                            .updateTitle(
                                    id,
                                    request.getTitle()
                            );

            return ResponseEntity
                    .ok(conversation);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // =====================================================
    // DELETE CONVERSATION
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteConversation(
            @PathVariable Long id) {

        try {

            conversationService
                    .deleteConversation(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // CREATE CONVERSATION REQUEST
    // =====================================================

    public static class CreateConversationRequest {

        private String title;
        private String subject;

        public CreateConversationRequest() {
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(
                String title) {

            this.title =
                    title;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(
                String subject) {

            this.subject =
                    subject;
        }
    }

    // =====================================================
    // ADD MESSAGE REQUEST
    // =====================================================

    public static class AddMessageRequest {

        private String role;
        private String content;

        public AddMessageRequest() {
        }

        public String getRole() {
            return role;
        }

        public void setRole(
                String role) {

            this.role =
                    role;
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
    // UPDATE CONVERSATION REQUEST
    // =====================================================

    public static class UpdateConversationRequest {

        private String title;

        public UpdateConversationRequest() {
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(
                String title) {

            this.title =
                    title;
        }
    }
}
