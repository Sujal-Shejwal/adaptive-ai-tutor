package com.adaptiveaitutor.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.service.RagAnswerService;

@RestController
@RequestMapping("/api/rag")
public class RagAnswerController {

    private final RagAnswerService ragAnswerService;

    public RagAnswerController(
            RagAnswerService ragAnswerService) {

        this.ragAnswerService =
                ragAnswerService;
    }

    // =====================================================
    // ANSWER QUESTION USING RAG
    // =====================================================

    @GetMapping("/answer")
    public ResponseEntity<?> answer(
            @RequestParam String question) {

        try {

            String answer =
                    ragAnswerService
                            .answer(question);

            return ResponseEntity.ok(
                    Map.of(
                            "question",
                            question,
                            "answer",
                            answer
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }
}