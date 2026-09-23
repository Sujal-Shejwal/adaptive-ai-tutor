package com.adaptiveaitutor.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    // =====================================================
    // MESSAGE BROKER
    // =====================================================

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry) {

        // Messages sent to /topic will be
        // delivered to subscribed users.
        registry.enableSimpleBroker(
                "/topic"
        );

        // Messages sent from frontend to backend
        // will use /app.
        registry.setApplicationDestinationPrefixes(
                "/app"
        );
    }


    // =====================================================
    // WEBSOCKET ENDPOINT
    // =====================================================

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry) {

        registry.addEndpoint(
                "/ws"
        )
        .setAllowedOriginPatterns(
                "http://localhost:5173"
        );
    }
}