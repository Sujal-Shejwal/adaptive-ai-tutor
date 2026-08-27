package com.adaptiveaitutor.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

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
import com.adaptiveaitutor.backend.service.QuizService;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    private final QuizService quizService;

    public QuizController(
            QuizService quizService) {

        this.quizService =
                quizService;
    }

    // =====================================================
    // CREATE QUIZ
    // =====================================================

    @PostMapping
    public ResponseEntity<QuizResponse> createQuiz(
            @RequestBody CreateQuizRequest request) {

        Quiz quiz =
                quizService.createQuiz(
                        request.getTitle(),
                        request.getDuration(),
                        request.getSubjectId(),
                        request.getTeacherId(),
                        request.getDeadlineHours()
                );

        QuizResponse response =
                new QuizResponse(
                        quiz.getId(),
                        quiz.getTitle(),
                        quiz.getDuration(),
                        quiz.getSubject().getId(),
                        quiz.getCreatedAt(),
                        quiz.getDueAt()
                );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET ALL QUIZZES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<QuizResponse>>
            getAllQuizzes() {

        List<Quiz> quizzes =
                quizService.getAllQuizzes();

        List<QuizResponse> response =
                quizzes.stream()
                        .map(
                                quiz ->
                                        new QuizResponse(
                                                quiz.getId(),
                                                quiz.getTitle(),
                                                quiz.getDuration(),
                                                quiz.getSubject().getId(),
                                                quiz.getCreatedAt(),
                                                quiz.getDueAt()
                                        )
                        )
                        .collect(
                                Collectors.toList()
                        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET QUIZ BY ID
    // =====================================================

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizResponse>
            getQuiz(
                    @PathVariable Long quizId) {

        try {

            Quiz quiz =
                    quizService.getQuiz(
                            quizId
                    );

            QuizResponse response =
                    new QuizResponse(
                            quiz.getId(),
                            quiz.getTitle(),
                            quiz.getDuration(),
                            quiz.getSubject().getId(),
                            quiz.getCreatedAt(),
                            quiz.getDueAt()
                    );

            return ResponseEntity.ok(
                    response
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
    public ResponseEntity<List<QuizResponse>>
            getTeacherQuizzes(
                    @PathVariable Long teacherId) {

        List<Quiz> quizzes =
                quizService.getTeacherQuizzes(
                        teacherId
                );

        List<QuizResponse> response =
                quizzes.stream()
                        .map(
                                quiz ->
                                        new QuizResponse(
                                                quiz.getId(),
                                                quiz.getTitle(),
                                                quiz.getDuration(),
                                                quiz.getSubject().getId(),
                                                quiz.getCreatedAt(),
                                                quiz.getDueAt()
                                        )
                        )
                        .collect(
                                Collectors.toList()
                        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET SUBJECT QUIZZES
    // =====================================================

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<QuizResponse>>
            getSubjectQuizzes(
                    @PathVariable Long subjectId) {

        List<Quiz> quizzes =
                quizService.getSubjectQuizzes(
                        subjectId
                );

        List<QuizResponse> response =
                quizzes.stream()
                        .map(
                                quiz ->
                                        new QuizResponse(
                                                quiz.getId(),
                                                quiz.getTitle(),
                                                quiz.getDuration(),
                                                quiz.getSubject().getId(),
                                                quiz.getCreatedAt(),
                                                quiz.getDueAt()
                                        )
                        )
                        .collect(
                                Collectors.toList()
                        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // ADD QUESTION
    // =====================================================

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<QuizQuestionResponse>
            addQuestion(
                    @PathVariable Long quizId,
                    @RequestBody AddQuestionRequest request) {

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

        QuizQuestionResponse response =
                new QuizQuestionResponse(
                        question.getId(),
                        question.getQuestion(),
                        question.getOption1(),
                        question.getOption2(),
                        question.getOption3(),
                        question.getOption4(),
                        question.getCorrectAnswer()
                );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET QUESTIONS FOR QUIZ
    // =====================================================

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionResponse>>
            getQuestions(
                    @PathVariable Long quizId) {

        List<QuizQuestion> questions =
                quizService.getQuestions(
                        quizId
                );

        List<QuizQuestionResponse> response =
                questions.stream()
                        .map(
                                question ->
                                        new QuizQuestionResponse(
                                                question.getId(),
                                                question.getQuestion(),
                                                question.getOption1(),
                                                question.getOption2(),
                                                question.getOption3(),
                                                question.getOption4(),
                                                question.getCorrectAnswer()
                                        )
                        )
                        .collect(
                                Collectors.toList()
                        );

        return ResponseEntity.ok(
                response
        );
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

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
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
    // QUIZ RESPONSE
    // =====================================================

    public static class QuizResponse {

        private Long id;

        private String title;

        private Integer duration;

        private Long subjectId;

        private java.time.LocalDateTime createdAt;

        private java.time.LocalDateTime dueAt;

        public QuizResponse(
                Long id,
                String title,
                Integer duration,
                Long subjectId,
                java.time.LocalDateTime createdAt,
                java.time.LocalDateTime dueAt) {

            this.id = id;
            this.title = title;
            this.duration = duration;
            this.subjectId = subjectId;
            this.createdAt = createdAt;
            this.dueAt = dueAt;
        }

        public Long getId() {
            return id;
        }

        public String getTitle() {
            return title;
        }

        public Integer getDuration() {
            return duration;
        }

        public Long getSubjectId() {
            return subjectId;
        }

        public java.time.LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public java.time.LocalDateTime getDueAt() {
            return dueAt;
        }
    }

    // =====================================================
    // QUESTION RESPONSE
    // =====================================================

    public static class QuizQuestionResponse {

        private Long id;

        private String question;

        private String option1;

        private String option2;

        private String option3;

        private String option4;

        private Integer correctAnswer;

        public QuizQuestionResponse(
                Long id,
                String question,
                String option1,
                String option2,
                String option3,
                String option4,
                Integer correctAnswer) {

            this.id = id;
            this.question = question;
            this.option1 = option1;
            this.option2 = option2;
            this.option3 = option3;
            this.option4 = option4;
            this.correctAnswer = correctAnswer;
        }

        public Long getId() {
            return id;
        }

        public String getQuestion() {
            return question;
        }

        public String getOption1() {
            return option1;
        }

        public String getOption2() {
            return option2;
        }

        public String getOption3() {
            return option3;
        }

        public String getOption4() {
            return option4;
        }

        public Integer getCorrectAnswer() {
            return correctAnswer;
        }
    }
}