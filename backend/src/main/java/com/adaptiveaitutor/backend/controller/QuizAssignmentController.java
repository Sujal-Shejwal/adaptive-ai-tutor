package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.dto.ClassroomQuizResultResponse;
import com.adaptiveaitutor.backend.dto.QuizAssignmentResponse;
import com.adaptiveaitutor.backend.entity.QuizAssignment;
import com.adaptiveaitutor.backend.service.QuizAssignmentService;

@RestController
@RequestMapping("/api/quiz-assignments")
public class QuizAssignmentController {

    private final QuizAssignmentService quizAssignmentService;

    public QuizAssignmentController(
            QuizAssignmentService quizAssignmentService) {

        this.quizAssignmentService =
                quizAssignmentService;
    }

    // =====================================================
    // ASSIGN QUIZ TO CLASSROOM
    // =====================================================

    @PostMapping(
            "/classroom/{classroomId}/quiz/{quizId}/teacher/{teacherId}"
    )
    public ResponseEntity<?> assignQuizToClassroom(
            @PathVariable Long classroomId,
            @PathVariable Long quizId,
            @PathVariable Long teacherId) {

        try {

            QuizAssignment assignment =
                    quizAssignmentService
                            .assignQuizToClassroom(
                                    classroomId,
                                    quizId,
                                    teacherId
                            );

            return ResponseEntity.ok(
                    toResponse(assignment)
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
                    );
        }
    }

    // =====================================================
    // GET CLASSROOM QUIZZES
    // =====================================================

    @GetMapping(
            "/classroom/{classroomId}/teacher/{teacherId}"
    )
    public ResponseEntity<?> getClassroomQuizzes(
            @PathVariable Long classroomId,
            @PathVariable Long teacherId) {

        try {

            List<QuizAssignmentResponse> response =
                    quizAssignmentService
                            .getClassroomQuizzes(
                                    classroomId,
                                    teacherId
                            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
                    );
        }
    }

    // =====================================================
    // GET CLASSROOM RESULTS
    // =====================================================

    @GetMapping("/classroom/{classroomId}/results/teacher/{teacherId}")
    public ResponseEntity<?> getClassroomResults(
            @PathVariable Long classroomId,
            @PathVariable Long teacherId) {
        try {
            List<ClassroomQuizResultResponse> response =
                    quizAssignmentService.getClassroomResults(classroomId, teacherId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException exception) {
            return ResponseEntity.status(403).body(exception.getMessage());
        }
    }

    // =====================================================
    // GET ALL QUIZZES AVAILABLE TO STUDENT
    // =====================================================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentQuizzes(
            @PathVariable Long studentId) {

        try {

            List<QuizAssignmentResponse> response =
                    quizAssignmentService
                            .getStudentQuizzes(
                                    studentId
                            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
                    );
        }
    }

    // =====================================================
    // GET ONE STUDENT CLASSROOM QUIZ
    // =====================================================

    @GetMapping(
            "/student/{studentId}/classroom/{classroomId}/quiz/{quizId}"
    )
    public ResponseEntity<?> getStudentQuiz(
            @PathVariable Long studentId,
            @PathVariable Long classroomId,
            @PathVariable Long quizId) {

        try {

            QuizAssignmentResponse response =
                    quizAssignmentService
                            .getStudentQuiz(
                                    classroomId,
                                    quizId,
                                    studentId
                            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .status(403)
                    .body(
                            exception.getMessage()
                    );
        }
    }

    // =====================================================
    // REMOVE QUIZ FROM CLASSROOM
    // =====================================================

    @DeleteMapping(
            "/classroom/{classroomId}/quiz/{quizId}/teacher/{teacherId}"
    )
    public ResponseEntity<?> removeQuizFromClassroom(
            @PathVariable Long classroomId,
            @PathVariable Long quizId,
            @PathVariable Long teacherId) {

        try {

            quizAssignmentService
                    .removeQuizFromClassroom(
                            classroomId,
                            quizId,
                            teacherId
                    );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Quiz removed from classroom successfully."
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // RESPONSE MAPPER
    // =====================================================

    private QuizAssignmentResponse toResponse(
            QuizAssignment assignment) {

        return quizAssignmentServiceResponse(
                assignment
        );
    }

    /*
     * Keep the controller independent from the entity JSON structure.
     * The assignment service already performs the complete classroom,
     * quiz, teacher and enrollment validation.
     */
    private QuizAssignmentResponse quizAssignmentServiceResponse(
            QuizAssignment assignment) {

        Long classroomId =
                assignment.getClassroom() != null
                        ? assignment.getClassroom().getId()
                        : null;

        String classroomName =
                assignment.getClassroom() != null
                        ? assignment.getClassroom().getName()
                        : null;

        Long quizId =
                assignment.getQuiz() != null
                        ? assignment.getQuiz().getId()
                        : null;

        String quizTitle =
                assignment.getQuiz() != null
                        ? assignment.getQuiz().getTitle()
                        : null;

        Integer duration =
                assignment.getQuiz() != null
                        ? assignment.getQuiz().getDuration()
                        : null;

        java.time.LocalDateTime dueAt =
                assignment.getQuiz() != null
                        ? assignment.getQuiz().getDueAt()
                        : null;

        Long subjectId = null;
        String subjectName = null;
        Long topicId = null;
        String topicName = null;

        if (assignment.getQuiz() != null) {

            if (assignment.getQuiz().getSubject() != null) {

                subjectId =
                        assignment.getQuiz()
                                .getSubject()
                                .getId();

                subjectName =
                        assignment.getQuiz()
                                .getSubject()
                                .getName();
            }

            if (assignment.getQuiz().getTopic() != null) {

                topicId =
                        assignment.getQuiz()
                                .getTopic()
                                .getId();

                topicName =
                        assignment.getQuiz()
                                .getTopic()
                                .getTitle();
            }
        }

        return new QuizAssignmentResponse(
                assignment.getId(),
                classroomId,
                classroomName,
                quizId,
                quizTitle,
                duration,
                dueAt,
                assignment.getAssignedAt(),
                assignment.getStatus(),
                subjectId,
                subjectName,
                topicId,
                topicName
        );
    }

    // =====================================================
    // MESSAGE RESPONSE
    // =====================================================

    public static class MessageResponse {

        private final String message;

        public MessageResponse(
                String message) {

            this.message =
                    message;
        }

        public String getMessage() {
            return message;
        }
    }
}