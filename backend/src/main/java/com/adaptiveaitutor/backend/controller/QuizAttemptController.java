package com.adaptiveaitutor.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.QuizAttempt;
import com.adaptiveaitutor.backend.repository.QuizAttemptRepository;
import com.adaptiveaitutor.backend.service.QuizAttemptService;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;
    private final QuizAttemptRepository quizAttemptRepository;

    public QuizAttemptController(
            QuizAttemptService quizAttemptService,
            QuizAttemptRepository quizAttemptRepository) {

        this.quizAttemptService =
                quizAttemptService;

        this.quizAttemptRepository =
                quizAttemptRepository;
    }

    // =====================================================
    // SUBMIT QUIZ
    // =====================================================

    @PostMapping("/quiz/{quizId}/submit")
    public ResponseEntity<QuizAttemptResponse> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody SubmitQuizRequest request) {

        QuizAttempt attempt =
                quizAttemptService.submitQuiz(
                        quizId,
                        request.getStudentId(),
                        request.getAnswers()
                );

        return ResponseEntity.ok(
                toResponse(attempt)
        );
    }

    // =====================================================
    // CHECK WHETHER STUDENT ALREADY SUBMITTED
    // =====================================================

    @GetMapping("/quiz/{quizId}/student/{studentId}")
    public ResponseEntity<SubmissionStatusResponse>
            checkSubmissionStatus(
                    @PathVariable Long quizId,
                    @PathVariable Long studentId) {

        boolean submitted =
                quizAttemptRepository
                        .existsByQuizIdAndStudentId(
                                quizId,
                                studentId
                        );

        QuizAttempt attempt = null;

        if (submitted) {

            List<QuizAttempt> attempts =
                    quizAttemptRepository
                            .findByQuizId(quizId);

            for (QuizAttempt currentAttempt :
                    attempts) {

                if (currentAttempt
                        .getStudent()
                        .getId()
                        .equals(studentId)) {

                    attempt = currentAttempt;
                    break;
                }
            }
        }

        SubmissionStatusResponse response =
                new SubmissionStatusResponse(
                        submitted,
                        attempt != null
                                ? attempt.getId()
                                : null,
                        attempt != null
                                ? attempt.getScore()
                                : null,
                        attempt != null
                                ? attempt.getTotalQuestions()
                                : null,
                        attempt != null
                                ? attempt.getCorrectAnswers()
                                : null,
                        attempt != null
                                ? attempt.getSubmittedAt()
                                : null
                );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET STUDENT ATTEMPTS
    // =====================================================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<QuizAttemptResponse>>
            getStudentAttempts(
                    @PathVariable Long studentId) {

        List<QuizAttempt> attempts =
                quizAttemptService
                        .getStudentAttempts(
                                studentId
                        );

        List<QuizAttemptResponse> response =
                attempts.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET QUIZ ATTEMPTS
    // =====================================================

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizAttemptResponse>>
            getQuizAttempts(
                    @PathVariable Long quizId) {

        List<QuizAttempt> attempts =
                quizAttemptService
                        .getQuizAttempts(
                                quizId
                        );

        List<QuizAttemptResponse> response =
                attempts.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET ALL ATTEMPTS FOR TEACHER
    // =====================================================

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<QuizAttemptResponse>>
            getTeacherAttempts(
                    @PathVariable Long teacherId) {

        List<QuizAttempt> attempts =
                quizAttemptService
                        .getTeacherAttempts(
                                teacherId
                        );

        List<QuizAttemptResponse> response =
                attempts.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // RESPONSE MAPPER
    // =====================================================

    private QuizAttemptResponse toResponse(
            QuizAttempt attempt) {

        return new QuizAttemptResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getStudent().getId(),
                attempt.getStudent().getName(),
                attempt.getStudent().getEmail(),
                attempt.getScore(),
                attempt.getTotalQuestions(),
                attempt.getCorrectAnswers(),
                attempt.getSubmittedAt()
        );
    }

    // =====================================================
    // SUBMIT REQUEST
    // =====================================================

    public static class SubmitQuizRequest {

        private Long studentId;

        private Map<Long, Integer> answers;

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(
                Long studentId) {

            this.studentId =
                    studentId;
        }

        public Map<Long, Integer> getAnswers() {
            return answers;
        }

        public void setAnswers(
                Map<Long, Integer> answers) {

            this.answers =
                    answers;
        }
    }

    // =====================================================
    // SUBMISSION STATUS RESPONSE
    // =====================================================

    public static class SubmissionStatusResponse {

        private Boolean submitted;

        private Long attemptId;

        private Integer score;

        private Integer totalQuestions;

        private Integer correctAnswers;

        private LocalDateTime submittedAt;

        public SubmissionStatusResponse(
                Boolean submitted,
                Long attemptId,
                Integer score,
                Integer totalQuestions,
                Integer correctAnswers,
                LocalDateTime submittedAt) {

            this.submitted =
                    submitted;

            this.attemptId =
                    attemptId;

            this.score =
                    score;

            this.totalQuestions =
                    totalQuestions;

            this.correctAnswers =
                    correctAnswers;

            this.submittedAt =
                    submittedAt;
        }

        public Boolean getSubmitted() {
            return submitted;
        }

        public Long getAttemptId() {
            return attemptId;
        }

        public Integer getScore() {
            return score;
        }

        public Integer getTotalQuestions() {
            return totalQuestions;
        }

        public Integer getCorrectAnswers() {
            return correctAnswers;
        }

        public LocalDateTime getSubmittedAt() {
            return submittedAt;
        }
    }

    // =====================================================
    // QUIZ ATTEMPT RESPONSE
    // =====================================================

    public static class QuizAttemptResponse {

        private Long id;

        private Long quizId;

        private Long studentId;

        private String studentName;

        private String studentEmail;

        private Integer score;

        private Integer totalQuestions;

        private Integer correctAnswers;

        private LocalDateTime submittedAt;

        public QuizAttemptResponse(
                Long id,
                Long quizId,
                Long studentId,
                String studentName,
                String studentEmail,
                Integer score,
                Integer totalQuestions,
                Integer correctAnswers,
                LocalDateTime submittedAt) {

            this.id =
                    id;

            this.quizId =
                    quizId;

            this.studentId =
                    studentId;

            this.studentName =
                    studentName;

            this.studentEmail =
                    studentEmail;

            this.score =
                    score;

            this.totalQuestions =
                    totalQuestions;

            this.correctAnswers =
                    correctAnswers;

            this.submittedAt =
                    submittedAt;
        }

        public Long getId() {
            return id;
        }

        public Long getQuizId() {
            return quizId;
        }

        public Long getStudentId() {
            return studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public String getStudentEmail() {
            return studentEmail;
        }

        public Integer getScore() {
            return score;
        }

        public Integer getTotalQuestions() {
            return totalQuestions;
        }

        public Integer getCorrectAnswers() {
            return correctAnswers;
        }

        public LocalDateTime getSubmittedAt() {
            return submittedAt;
        }
    }
}