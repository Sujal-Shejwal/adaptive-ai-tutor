package com.adaptiveaitutor.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.QuizQuestion;
import com.adaptiveaitutor.backend.service.AIQuizGeneratorService;
import com.adaptiveaitutor.backend.service.QuizService;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    private final QuizService quizService;

    private final AIQuizGeneratorService aiQuizGeneratorService;

    public QuizController(
            QuizService quizService,
            AIQuizGeneratorService aiQuizGeneratorService) {

        this.quizService =
                quizService;

        this.aiQuizGeneratorService =
                aiQuizGeneratorService;
    }

    // =====================================================
    // CREATE QUIZ
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createQuiz(
            @RequestBody CreateQuizRequest request) {

        try {

            Quiz quiz =
                    quizService.createQuiz(
                            request.getTitle(),
                            request.getDuration(),
                            request.getSubjectId(),
                            request.getTeacherId(),
                            request.getDeadlineHours()
                    );

            return ResponseEntity.ok(
                    quiz
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
    // GET ALL QUIZZES
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getAllQuizzes() {

        try {

            return ResponseEntity.ok(
                    quizService.getAllQuizzes()
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
    // GET QUIZ BY ID
    // =====================================================

    @GetMapping("/{quizId}")
    public ResponseEntity<?> getQuiz(
            @PathVariable Long quizId) {

        try {

            return ResponseEntity.ok(
                    quizService.getQuiz(
                            quizId
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // GET TEACHER QUIZZES
    // =====================================================

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<?> getTeacherQuizzes(
            @PathVariable Long teacherId) {

        try {

            return ResponseEntity.ok(
                    quizService.getTeacherQuizzes(
                            teacherId
                    )
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
    // GET SUBJECT QUIZZES
    // =====================================================

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<?> getSubjectQuizzes(
            @PathVariable Long subjectId) {

        try {

            return ResponseEntity.ok(
                    quizService.getSubjectQuizzes(
                            subjectId
                    )
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
    // ADD QUESTION
    // =====================================================

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<?> addQuestion(
            @PathVariable Long quizId,
            @RequestBody AddQuestionRequest request) {

        try {

            QuizQuestion question =
                    quizService.addQuestion(
                            quizId,
                            request.getQuestion(),
                            request.getOption1(),
                            request.getOption2(),
                            request.getOption3(),
                            request.getOption4(),
                            request.getCorrectAnswer()
                    );

            return ResponseEntity.ok(
                    question
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
    // GET QUESTIONS
    // =====================================================

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<?> getQuestions(
            @PathVariable Long quizId) {

        try {

            return ResponseEntity.ok(
                    quizService.getQuestions(
                            quizId
                    )
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
    // DELETE QUIZ
    // =====================================================

    @DeleteMapping("/{quizId}")
    public ResponseEntity<?> deleteQuiz(
            @PathVariable Long quizId) {

        try {

            boolean deleted =
                    quizService.deleteQuiz(
                            quizId
                    );

            if (!deleted) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Quiz deleted successfully."
                    )
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
    // AI QUIZ GENERATION
    // =====================================================

    @PostMapping("/ai/generate")
    public ResponseEntity<?> generateAIQuiz(
            @RequestBody AIQuizGenerationRequest request) {

        try {

            AIQuizGeneratorService.QuizGenerationResult result =
                    aiQuizGeneratorService.generateQuiz(
                            request.getTopicId(),
                            request.getQuestionCount(),
                            request.getDuration(),
                            request.getSubjectId(),
                            request.getTeacherId(),
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
    // CREATE QUIZ REQUEST
    // =====================================================

    public static class CreateQuizRequest {

        private String title;

        private Integer duration;

        private Long subjectId;

        private Long teacherId;

        private Integer deadlineHours;

        public CreateQuizRequest() {
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(
                String title) {

            this.title =
                    title;
        }

        public Integer getDuration() {
            return duration;
        }

        public void setDuration(
                Integer duration) {

            this.duration =
                    duration;
        }

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(
                Long subjectId) {

            this.subjectId =
                    subjectId;
        }

        public Long getTeacherId() {
            return teacherId;
        }

        public void setTeacherId(
                Long teacherId) {

            this.teacherId =
                    teacherId;
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

    // =====================================================
    // ADD QUESTION REQUEST
    // =====================================================

    public static class AddQuestionRequest {

        private String question;

        private String option1;

        private String option2;

        private String option3;

        private String option4;

        private Integer correctAnswer;

        public AddQuestionRequest() {
        }

        public String getQuestion() {
            return question;
        }

        public void setQuestion(
                String question) {

            this.question =
                    question;
        }

        public String getOption1() {
            return option1;
        }

        public void setOption1(
                String option1) {

            this.option1 =
                    option1;
        }

        public String getOption2() {
            return option2;
        }

        public void setOption2(
                String option2) {

            this.option2 =
                    option2;
        }

        public String getOption3() {
            return option3;
        }

        public void setOption3(
                String option3) {

            this.option3 =
                    option3;
        }

        public String getOption4() {
            return option4;
        }

        public void setOption4(
                String option4) {

            this.option4 =
                    option4;
        }

        public Integer getCorrectAnswer() {
            return correctAnswer;
        }

        public void setCorrectAnswer(
                Integer correctAnswer) {

            this.correctAnswer =
                    correctAnswer;
        }
    }

    // =====================================================
    // AI QUIZ GENERATION REQUEST
    // =====================================================

    public static class AIQuizGenerationRequest {

        private Long topicId;

        private Integer questionCount;

        private Integer duration;

        private Long subjectId;

        private Long teacherId;

        private Integer deadlineHours;

        public AIQuizGenerationRequest() {
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

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(
                Long subjectId) {

            this.subjectId =
                    subjectId;
        }

        public Long getTeacherId() {
            return teacherId;
        }

        public void setTeacherId(
                Long teacherId) {

            this.teacherId =
                    teacherId;
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