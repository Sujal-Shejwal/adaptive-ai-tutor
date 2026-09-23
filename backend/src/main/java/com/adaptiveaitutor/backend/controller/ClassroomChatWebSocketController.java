package com.adaptiveaitutor.backend.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.adaptiveaitutor.backend.dto.ClassroomChatMessageResponse;
import com.adaptiveaitutor.backend.service.ClassroomChatService;

@Controller
public class ClassroomChatWebSocketController {

    private final ClassroomChatService classroomChatService;

    private final SimpMessagingTemplate messagingTemplate;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ClassroomChatWebSocketController(
            ClassroomChatService classroomChatService,
            SimpMessagingTemplate messagingTemplate) {

        this.classroomChatService =
                classroomChatService;

        this.messagingTemplate =
                messagingTemplate;
    }


    // =====================================================
    // RECEIVE REAL-TIME MESSAGE
    // =====================================================

    @MessageMapping(
            "/classrooms/{classroomId}/chat"
    )
    public void sendMessage(
            @DestinationVariable Long classroomId,
            @Payload ClassroomChatWebSocketRequest request) {

        // -------------------------------------------------
        // SAVE MESSAGE
        // -------------------------------------------------

        ClassroomChatMessageResponse savedMessage =
                classroomChatService.sendMessage(
                        classroomId,
                        request.getUserId(),
                        request.getContent()
                );


        // -------------------------------------------------
        // BROADCAST TO CLASSROOM
        // -------------------------------------------------

        messagingTemplate.convertAndSend(
                "/topic/classrooms/"
                        + classroomId
                        + "/chat",
                savedMessage
        );
    }


    // =====================================================
    // WEBSOCKET REQUEST
    // =====================================================

    public static class ClassroomChatWebSocketRequest {

        private Long userId;

        private String content;


        public ClassroomChatWebSocketRequest() {
        }


        public Long getUserId() {
            return userId;
        }


        public void setUserId(
                Long userId) {

            this.userId =
                    userId;
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
}