package com.adaptiveaitutor.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.service.AIQuizGeneratorService;
import com.adaptiveaitutor.backend.service.AdaptiveQuizService;

@RestController
@RequestMapping("/api/adaptive")
@CrossOrigin(origins = "http://localhost:5173")
public class AdaptiveQuizController {

    private final AdaptiveQuizService adaptiveQuizService;

    public AdaptiveQuizController(
            AdaptiveQuizService adaptiveQuizService) {

        this.adaptiveQuizService =
                adaptiveQuizService;
    }

    // =====================================================
    // GENERATE ADAPTIVE PRACTICE QUIZ
    // =====================================================

    @PostMapping("/quiz")
    public ResponseEntity<?> generateAdaptiveQuiz(
            @RequestBody AdaptiveQuizRequest request) {

        try {

            AIQuizGeneratorService.QuizGenerationResult result =
                    adaptiveQuizService.generateAdaptiveQuiz(
                            request.getStudentId(),
                            request.getTopicId(),
                            request.getQuestionCount(),
                            request.getDuration(),
                            request.getDeadlineHours()
                    );

            return ResponseEntity.ok(
                    result
            );

        } catch (RuntimeException exception) {

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
    // REQUEST
    // =====================================================

    public static class AdaptiveQuizRequest {

        private Long studentId;

        private Long topicId;

        private Integer questionCount;

        private Integer duration;

        private Integer deadlineHours;

        public AdaptiveQuizRequest() {
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(
                Long studentId) {

            this.studentId =
                    studentId;
        }

        public Long getTopicId() {
            return topicId;
        }

        public void setTopicId(
                Long topicId) {

            this.topicId =
                    topicId;
        }

        public Integer getQuestionCount() {
            return questionCount;
        }

        public void setQuestionCount(
                Integer questionCount) {

            this.questionCount =
                    questionCount;
        }

        public Integer getDuration() {
            return duration;
        }

        public void setDuration(
                Integer duration) {

            this.duration =
                    duration;
        }

        public Integer getDeadlineHours() {
            return deadlineHours;
        }

        public void setDeadlineHours(
                Integer deadlineHours) {

            this.deadlineHours =
                    deadlineHours;
        }
    }
}