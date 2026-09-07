package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.QuizAssignment;
import com.adaptiveaitutor.backend.entity.QuizAttempt;
import com.adaptiveaitutor.backend.entity.QuizQuestion;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.ClassroomEnrollmentRepository;
import com.adaptiveaitutor.backend.repository.QuizAssignmentRepository;
import com.adaptiveaitutor.backend.repository.QuizAttemptRepository;
import com.adaptiveaitutor.backend.repository.QuizQuestionRepository;
import com.adaptiveaitutor.backend.repository.QuizRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class QuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final UserRepository userRepository;
    private final ClassroomEnrollmentRepository classroomEnrollmentRepository;
    private final QuizAssignmentRepository quizAssignmentRepository;

    public QuizAttemptService(
            QuizAttemptRepository quizAttemptRepository,
            QuizRepository quizRepository,
            QuizQuestionRepository quizQuestionRepository,
            UserRepository userRepository,
            ClassroomEnrollmentRepository classroomEnrollmentRepository,
            QuizAssignmentRepository quizAssignmentRepository) {

        this.quizAttemptRepository =
                quizAttemptRepository;

        this.quizRepository =
                quizRepository;

        this.quizQuestionRepository =
                quizQuestionRepository;

        this.userRepository =
                userRepository;

        this.classroomEnrollmentRepository =
                classroomEnrollmentRepository;

        this.quizAssignmentRepository =
                quizAssignmentRepository;
    }

    // =====================================================
    // SUBMIT QUIZ
    // =====================================================

    public QuizAttempt submitQuiz(
            Long quizId,
            Long studentId,
            Map<Long, Integer> answers) {

        // -------------------------------------------------
        // FIND QUIZ
        // -------------------------------------------------

        Quiz quiz =
                quizRepository
                        .findById(quizId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Quiz not found"
                                )
                        );

        // -------------------------------------------------
        // FIND STUDENT
        // -------------------------------------------------

        User student =
                userRepository
                        .findById(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student not found"
                                )
                        );

        // -------------------------------------------------
        // CHECK STUDENT ROLE
        // -------------------------------------------------

        if (!"student".equalsIgnoreCase(
                student.getRole())) {

            throw new RuntimeException(
                    "Only students can submit quizzes"
            );
        }

        // -------------------------------------------------
        // CHECK CLASSROOM ENROLLMENT + QUIZ ASSIGNMENT
        //
        // A student can submit this quiz only when:
        // 1. The student is enrolled in a classroom.
        // 2. The quiz is assigned to that classroom.
        // 3. The assignment is ACTIVE.
        //
        // This supports the same quiz being assigned
        // to multiple classrooms.
        // -------------------------------------------------

        List<ClassroomEnrollment> enrollments =
                classroomEnrollmentRepository
                        .findByStudentId(studentId);

        boolean classroomQuizAccess = false;

        for (ClassroomEnrollment enrollment :
                enrollments) {

            if (enrollment == null ||
                    enrollment.getClassroom() == null) {

                continue;
            }

            Long classroomId =
                    enrollment.getClassroom().getId();

            if (classroomId == null) {
                continue;
            }

            QuizAssignment assignment =
                    quizAssignmentRepository
                            .findByClassroomIdAndQuizId(
                                    classroomId,
                                    quizId
                            )
                            .orElse(null);

            if (assignment == null) {
                continue;
            }

            if (!"ACTIVE".equalsIgnoreCase(
                    assignment.getStatus())) {

                continue;
            }

            classroomQuizAccess = true;
            break;
        }

        if (!classroomQuizAccess) {

            throw new RuntimeException(
                    "You are not enrolled in a classroom where this quiz is assigned"
            );
        }

        // -------------------------------------------------
        // CHECK DUPLICATE SUBMISSION
        // -------------------------------------------------

        if (quizAttemptRepository
                .existsByQuizIdAndStudentId(
                        quizId,
                        studentId
                )) {

            throw new RuntimeException(
                    "Quiz has already been submitted by this student"
            );
        }

        // -------------------------------------------------
        // CHECK DEADLINE
        // -------------------------------------------------

        if (quiz.getDueAt() != null &&
                LocalDateTime.now()
                        .isAfter(
                                quiz.getDueAt()
                        )) {

            throw new RuntimeException(
                    "Quiz submission deadline has passed"
            );
        }

        // -------------------------------------------------
        // GET QUESTIONS
        // -------------------------------------------------

        List<QuizQuestion> questions =
                quizQuestionRepository
                        .findByQuizId(quizId);

        if (questions.isEmpty()) {

            throw new RuntimeException(
                    "This quiz has no questions"
            );
        }

        // -------------------------------------------------
        // CALCULATE SCORE
        // -------------------------------------------------

        int correctAnswers = 0;

        for (QuizQuestion question :
                questions) {

            Integer selectedAnswer =
                    answers != null
                            ? answers.get(
                                    question.getId()
                            )
                            : null;

            if (selectedAnswer != null &&
                    selectedAnswer.equals(
                            question.getCorrectAnswer()
                    )) {

                correctAnswers++;
            }
        }

        int totalQuestions =
                questions.size();

        int score =
                (int) Math.round(
                        (
                                (double) correctAnswers
                                        / totalQuestions
                        ) * 100
                );

        // -------------------------------------------------
        // CREATE ATTEMPT
        // -------------------------------------------------

        QuizAttempt attempt =
                new QuizAttempt(
                        quiz,
                        student,
                        score,
                        totalQuestions,
                        correctAnswers,
                        LocalDateTime.now()
                );

        // -------------------------------------------------
        // SAVE ATTEMPT
        // -------------------------------------------------

        return quizAttemptRepository.save(
                attempt
        );
    }

    // =====================================================
    // GET STUDENT ATTEMPTS
    // =====================================================

    public List<QuizAttempt> getStudentAttempts(
            Long studentId) {

        return quizAttemptRepository
                .findByStudentId(studentId);
    }

    // =====================================================
    // GET QUIZ ATTEMPTS
    // =====================================================

    public List<QuizAttempt> getQuizAttempts(
            Long quizId) {

        return quizAttemptRepository
                .findByQuizId(quizId);
    }

    // =====================================================
    // GET ALL ATTEMPTS FOR A TEACHER'S QUIZZES
    // =====================================================

    public List<QuizAttempt> getTeacherAttempts(
            Long teacherId) {

        User teacher =
                userRepository
                        .findById(teacherId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher not found"
                                )
                        );

        if (!"teacher".equalsIgnoreCase(
                teacher.getRole())) {

            throw new RuntimeException(
                    "Only teachers can access teacher performance"
            );
        }

        List<Quiz> quizzes =
                quizRepository
                        .findByCreatedById(
                                teacherId
                        );

        List<QuizAttempt> allAttempts =
                new ArrayList<>();

        for (Quiz quiz : quizzes) {

            List<QuizAttempt> attempts =
                    quizAttemptRepository
                            .findByQuizId(
                                    quiz.getId()
                            );

            allAttempts.addAll(
                    attempts
            );
        }

        return allAttempts;
    }
}