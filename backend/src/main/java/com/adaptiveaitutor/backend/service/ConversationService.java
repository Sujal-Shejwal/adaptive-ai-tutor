package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.ChatMessage;
import com.adaptiveaitutor.backend.entity.Conversation;
import com.adaptiveaitutor.backend.repository.ChatMessageRepository;
import com.adaptiveaitutor.backend.repository.ConversationRepository;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ConversationService(
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository) {

        this.conversationRepository =
                conversationRepository;

        this.chatMessageRepository =
                chatMessageRepository;
    }

    // =====================================================
    // CREATE CONVERSATION
    // =====================================================

    public Conversation createConversation(
            String title,
            String subject) {

        String safeTitle =
                title == null ||
                title.isBlank()
                        ? "New Conversation"
                        : title.trim();

        String safeSubject =
                subject == null ||
                subject.isBlank()
                        ? "AI"
                        : subject.trim();

        Conversation conversation =
                new Conversation(
                        safeTitle,
                        safeSubject
                );

        return conversationRepository.save(
                conversation
        );
    }

    // =====================================================
    // GET ALL CONVERSATIONS
    // =====================================================

    public List<Conversation> getAllConversations() {

        return conversationRepository
                .findAllByOrderByUpdatedAtDesc();
    }

    // =====================================================
    // GET CONVERSATION BY ID
    // =====================================================

    public Conversation getConversationById(
            Long conversationId) {

        return conversationRepository
                .findById(conversationId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Conversation not found: "
                                        + conversationId
                        )
                );
    }

    // =====================================================
    // GET MESSAGES
    // =====================================================

    @Transactional(readOnly = true)
    public List<ChatMessage> getMessages(
            Long conversationId) {

        if (!conversationRepository.existsById(
                conversationId)) {

            throw new RuntimeException(
                    "Conversation not found: "
                            + conversationId
            );
        }

        return chatMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(
                        conversationId
                );
    }

    // =====================================================
    // ADD MESSAGE
    // =====================================================

    @Transactional
    public ChatMessage addMessage(
            Long conversationId,
            String role,
            String content) {

        if (
                role == null ||
                role.isBlank()
        ) {

            throw new RuntimeException(
                    "Message role cannot be empty."
            );
        }

        if (
                content == null ||
                content.isBlank()
        ) {

            throw new RuntimeException(
                    "Message content cannot be empty."
            );
        }

        Conversation conversation =
                getConversationById(
                        conversationId
                );

        ChatMessage chatMessage =
                new ChatMessage(
                        role.trim(),
                        content.trim()
                );

        chatMessage.setConversation(
                conversation
        );

        ChatMessage savedMessage =
                chatMessageRepository.save(
                        chatMessage
                );

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        conversationRepository.save(
                conversation
        );

        return savedMessage;
    }

    // =====================================================
    // UPDATE MESSAGE
    // =====================================================

    @Transactional
    public ChatMessage updateMessage(
            Long messageId,
            String content) {

        if (
                content == null ||
                content.isBlank()
        ) {

            throw new RuntimeException(
                    "Message content cannot be empty."
            );
        }

        ChatMessage message =
                chatMessageRepository
                        .findById(messageId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Message not found: "
                                                + messageId
                                )
                        );

        message.setContent(
                content.trim()
        );

        ChatMessage updatedMessage =
                chatMessageRepository.save(
                        message
                );

        Conversation conversation =
                message.getConversation();

        if (conversation != null) {

            conversation.setUpdatedAt(
                    LocalDateTime.now()
            );

            conversationRepository.save(
                    conversation
            );
        }

        return updatedMessage;
    }

    // =====================================================
    // PREPARE MESSAGE FOR REGENERATION
    // =====================================================
    //
    // Updates the edited user message and removes all
    // messages that came after it.
    //
    // Example:
    //
    // User: What is entropy?
    // AI:   Entropy is...
    // User: Give example.
    // AI:   ...
    //
    // Edit "What is entropy?"
    //
    // Result:
    //
    // User: Edited question
    //
    // Then Gemini will generate a new AI answer.
    //
    // =====================================================

    @Transactional
    public ChatMessage prepareMessageRegeneration(
            Long conversationId,
            Long messageId,
            String content) {

        if (
                content == null ||
                content.isBlank()
        ) {

            throw new RuntimeException(
                    "Message content cannot be empty."
            );
        }

        Conversation conversation =
                getConversationById(
                        conversationId
                );

        List<ChatMessage> messages =
                chatMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversationId
                        );

        int targetIndex = -1;

        for (
                int i = 0;
                i < messages.size();
                i++
        ) {

            if (
                    messages.get(i)
                            .getId()
                            .equals(messageId)
            ) {

                targetIndex = i;

                break;
            }
        }

        if (targetIndex == -1) {

            throw new RuntimeException(
                    "Message not found in conversation: "
                            + messageId
            );
        }

        ChatMessage targetMessage =
                messages.get(targetIndex);

        if (
                !"user".equalsIgnoreCase(
                        targetMessage.getRole()
                )
        ) {

            throw new RuntimeException(
                    "Only user messages can be regenerated."
            );
        }

        // -------------------------------------------------
        // UPDATE USER MESSAGE
        // -------------------------------------------------

        targetMessage.setContent(
                content.trim()
        );

        ChatMessage updatedMessage =
                chatMessageRepository.save(
                        targetMessage
                );

        // -------------------------------------------------
        // DELETE EVERYTHING AFTER EDITED MESSAGE
        // -------------------------------------------------

        if (
                targetIndex + 1 <
                messages.size()
        ) {

            List<ChatMessage> messagesToDelete =
                    new ArrayList<>(
                            messages.subList(
                                    targetIndex + 1,
                                    messages.size()
                            )
                    );

            chatMessageRepository.deleteAll(
                    messagesToDelete
            );

            chatMessageRepository.flush();
        }

        // -------------------------------------------------
        // UPDATE CONVERSATION TIME
        // -------------------------------------------------

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        conversationRepository.save(
                conversation
        );

        return updatedMessage;
    }

    // =====================================================
    // UPDATE CONVERSATION TITLE
    // =====================================================

    public Conversation updateTitle(
            Long conversationId,
            String title) {

        if (
                title == null ||
                title.isBlank()
        ) {

            throw new RuntimeException(
                    "Conversation title cannot be empty."
            );
        }

        Conversation conversation =
                getConversationById(
                        conversationId
                );

        conversation.setTitle(
                title.trim()
        );

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        return conversationRepository.save(
                conversation
        );
    }

    // =====================================================
    // DELETE CONVERSATION
    // =====================================================

    @Transactional
    public void deleteConversation(
            Long conversationId) {

        Conversation conversation =
                getConversationById(
                        conversationId
                );

        conversationRepository.delete(
                conversation
        );
    }
}