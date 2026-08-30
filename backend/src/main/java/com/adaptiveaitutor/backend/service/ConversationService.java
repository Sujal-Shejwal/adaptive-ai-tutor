package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;
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