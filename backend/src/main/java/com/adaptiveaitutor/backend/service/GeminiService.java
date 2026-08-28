package com.adaptiveaitutor.backend.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final ChatClient chatClient;

    public GeminiService(
            ChatClient.Builder chatClientBuilder) {

        this.chatClient =
                chatClientBuilder.build();
    }

    // =====================================================
    // SEND MESSAGE TO GEMINI
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

        return chatClient
                .prompt()
                .user(
                        message.trim()
                )
                .call()
                .content();
    }
}