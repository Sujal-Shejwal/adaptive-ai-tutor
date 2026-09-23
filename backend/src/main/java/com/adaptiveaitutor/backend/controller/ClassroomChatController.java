package com.adaptiveaitutor.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.dto.ClassroomChatMessageResponse;
import com.adaptiveaitutor.backend.service.ClassroomChatService;

@RestController
@RequestMapping("/api/classroom-chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ClassroomChatController {

    private final ClassroomChatService
            classroomChatService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ClassroomChatController(
            ClassroomChatService classroomChatService) {

        this.classroomChatService =
                classroomChatService;
    }


    // =====================================================
    // GET CLASSROOM CHAT HISTORY
    // =====================================================

    @GetMapping(
            "/{classroomId}/messages/user/{userId}"
    )
    public ResponseEntity<?> getMessages(
            @PathVariable Long classroomId,
            @PathVariable Long userId) {

        try {

            List<ClassroomChatMessageResponse>
                    messages =
                    classroomChatService
                            .getMessages(
                                    classroomId,
                                    userId
                            );

            return ResponseEntity.ok(
                    messages
            );

        } catch (
                RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // SEND CLASSROOM MESSAGE
    // =====================================================

    @PostMapping(
            "/{classroomId}/messages"
    )
    public ResponseEntity<?> sendMessage(
            @PathVariable Long classroomId,
            @RequestBody Map<String, Object> request) {

        try {

            if (
                    request == null ||
                    request.get("userId") == null
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "User ID is required"
                                )
                        );
            }


            Long userId =
                    Long.valueOf(
                            request
                                    .get("userId")
                                    .toString()
                    );


            String content =
                    request.get("content")
                            != null
                            ? request
                                    .get("content")
                                    .toString()
                            : null;


            ClassroomChatMessageResponse
                    response =
                    classroomChatService
                            .sendMessage(
                                    classroomId,
                                    userId,
                                    content
                            );


            return ResponseEntity.ok(
                    response
            );

        } catch (
                RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }
}