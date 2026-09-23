package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.ChatMessage;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> { 

    List<ChatMessage>
    findByConversationIdOrderByCreatedAtAsc(
            Long conversationId
    );
}