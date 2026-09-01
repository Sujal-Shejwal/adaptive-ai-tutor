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

        if (
                !conversationRepository.existsById(
                        conversationId
                )
        ) {

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

        String cleanRole =
                role.trim();

        String cleanContent =
                content.trim();

        // -------------------------------------------------
        // AUTOMATIC TITLE
        // -------------------------------------------------

        if (
                "user".equalsIgnoreCase(
                        cleanRole
                ) &&
                isDefaultConversationTitle(
                        conversation.getTitle()
                ) &&
                conversation.getMessages().isEmpty()
        ) {

            conversation.setTitle(
                    generateConversationTitle(
                            cleanContent
                    )
            );
        }

        // -------------------------------------------------
        // CREATE MESSAGE
        // -------------------------------------------------

        ChatMessage chatMessage =
                new ChatMessage(
                        cleanRole,
                        cleanContent
                );

        chatMessage.setConversation(
                conversation
        );

        ChatMessage savedMessage =
                chatMessageRepository.save(
                        chatMessage
                );

        // -------------------------------------------------
        // UPDATE CONVERSATION
        // -------------------------------------------------

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        conversationRepository.save(
                conversation
        );

        return savedMessage;
    }

    // =====================================================
    // FIND MESSAGE INSIDE CONVERSATION
    // =====================================================

    @Transactional(readOnly = true)
    public ChatMessage getMessageForConversation(
            Long conversationId,
            Long messageId) {

        Conversation conversation =
                getConversationById(
                        conversationId
                );

        List<ChatMessage> messages =
                chatMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversationId
                        );

        for (
                ChatMessage message :
                messages
        ) {

            if (
                    message.getId()
                            .equals(messageId)
            ) {

                if (
                        !"user".equalsIgnoreCase(
                                message.getRole()
                        )
                ) {

                    throw new RuntimeException(
                            "Only user messages can be regenerated."
                    );
                }

                return message;
            }
        }

        throw new RuntimeException(
                "Message not found in conversation: "
                        + messageId
        );
    }

    // =====================================================
    // GET HISTORY BEFORE MESSAGE
    // =====================================================

    @Transactional(readOnly = true)
    public List<ChatMessage> getHistoryBeforeMessage(
            Long conversationId,
            Long messageId) {

        List<ChatMessage> messages =
                chatMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversationId
                        );

        List<ChatMessage> history =
                new ArrayList<>();

        for (
                ChatMessage message :
                messages
        ) {

            if (
                    message.getId()
                            .equals(messageId)
            ) {

                break;
            }

            history.add(
                    message
            );
        }

        boolean messageFound =
                messages.stream()
                        .anyMatch(
                                message ->
                                        message.getId()
                                                .equals(
                                                        messageId
                                                )
                        );

        if (!messageFound) {

            throw new RuntimeException(
                    "Message not found in conversation: "
                            + messageId
            );
        }

        return history;
    }

    // =====================================================
    // COMPLETE MESSAGE REGENERATION
    // =====================================================
    //
    // This is the ONLY method that modifies the database
    // after Gemini successfully returns a response.
    //
    // =====================================================

    @Transactional
    public RegenerationResult completeMessageRegeneration(
            Long conversationId,
            Long messageId,
            String newContent,
            String newAssistantResponse) {

        if (
                newContent == null ||
                newContent.isBlank()
        ) {

            throw new RuntimeException(
                    "Message content cannot be empty."
            );
        }

        if (
                newAssistantResponse == null ||
                newAssistantResponse.isBlank()
        ) {

            throw new RuntimeException(
                    "Assistant response cannot be empty."
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

        int targetIndex =
                -1;

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

                targetIndex =
                        i;

                break;
            }
        }

        if (
                targetIndex == -1
        ) {

            throw new RuntimeException(
                    "Message not found in conversation: "
                            + messageId
            );
        }

        ChatMessage targetMessage =
                messages.get(
                        targetIndex
                );

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
                newContent.trim()
        );

        ChatMessage updatedUserMessage =
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
        // CREATE NEW ASSISTANT MESSAGE
        // -------------------------------------------------

        ChatMessage assistantMessage =
                new ChatMessage(
                        "assistant",
                        newAssistantResponse.trim()
                );

        assistantMessage.setConversation(
                conversation
        );

        ChatMessage savedAssistantMessage =
                chatMessageRepository.save(
                        assistantMessage
                );

        // -------------------------------------------------
        // UPDATE CONVERSATION
        // -------------------------------------------------

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        conversationRepository.save(
                conversation
        );

        return new RegenerationResult(
                updatedUserMessage,
                savedAssistantMessage
        );
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

    // =====================================================
    // GENERATE CONVERSATION TITLE
    // =====================================================

    private String generateConversationTitle(
            String message) {

        if (
                message == null ||
                message.isBlank()
        ) {

            return "New Conversation";
        }

        String title =
                message
                        .replaceAll(
                                "\\s+",
                                " "
                        )
                        .trim();

        title =
                title.replaceAll(
                        "[?!.]+$",
                        ""
                ).trim();

        String lowerTitle =
                title.toLowerCase();

        if (
                lowerTitle.startsWith(
                        "what is "
                )
        ) {

            title =
                    title.substring(
                            8
                    ).trim();

        } else if (
                lowerTitle.startsWith(
                        "what are "
                )
        ) {

            title =
                    title.substring(
                            9
                    ).trim();

        } else if (
                lowerTitle.startsWith(
                        "explain "
                )
        ) {

            title =
                    title.substring(
                            8
                    ).trim();

        } else if (
                lowerTitle.startsWith(
                        "tell me about "
                )
        ) {

            title =
                    title.substring(
                            14
                    ).trim();

        } else if (
                lowerTitle.startsWith(
                        "define "
                )
        ) {

            title =
                    title.substring(
                            7
                    ).trim();
        }

        if (
                title.isBlank()
        ) {

            title =
                    message
                            .replaceAll(
                                    "\\s+",
                                    " "
                            )
                            .trim();
        }

        final int MAX_TITLE_LENGTH =
                50;

        if (
                title.length() >
                MAX_TITLE_LENGTH
        ) {

            title =
                    title.substring(
                            0,
                            MAX_TITLE_LENGTH
                    ).trim();

            int lastSpace =
                    title.lastIndexOf(
                            " "
                    );

            if (
                    lastSpace > 20
            ) {

                title =
                        title.substring(
                                0,
                                lastSpace
                        );
            }

            title =
                    title + "...";
        }

        if (
                !title.isBlank()
        ) {

            title =
                    Character.toUpperCase(
                            title.charAt(0)
                    )
                    +
                    title.substring(1);
        }

        return title;
    }

    // =====================================================
    // DEFAULT TITLE CHECK
    // =====================================================

    private boolean isDefaultConversationTitle(
            String title) {

        return title == null ||
                title.isBlank() ||
                title.equalsIgnoreCase(
                        "New Conversation"
                );
    }

    // =====================================================
    // REGENERATION RESULT
    // =====================================================

    public static class RegenerationResult {

        private final ChatMessage userMessage;

        private final ChatMessage assistantMessage;

        public RegenerationResult(
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
}