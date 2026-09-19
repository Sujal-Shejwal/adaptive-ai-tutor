package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.entity.Notification;
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
    private final ClassroomEnrollmentRepository enrollmentRepository;
    private final QuizAssignmentRepository assignmentRepository;
    private final NotificationService notificationService;

    public QuizAttemptService(
            QuizAttemptRepository quizAttemptRepository,
            QuizRepository quizRepository,
            QuizQuestionRepository quizQuestionRepository,
            UserRepository userRepository,
            ClassroomEnrollmentRepository enrollmentRepository,
            QuizAssignmentRepository assignmentRepository,
            NotificationService notificationService) {

        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.notificationService = notificationService;
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
        // VERIFY STUDENT ROLE
        // -------------------------------------------------

        if (!"student".equalsIgnoreCase(
                student.getRole())) {

            throw new RuntimeException(
                    "Only students can submit quizzes"
            );
        }

        // -------------------------------------------------
        // VERIFY CLASSROOM ENROLLMENT + ASSIGNMENT
        // -------------------------------------------------
        //
        // The quiz can be assigned to one or more
        // classrooms.
        //
        // The student must have:
        //
        // 1. An ACTIVE classroom enrollment
        // 2. An ACTIVE quiz assignment in that classroom
        //
        // The student is authorized if at least one
        // matching active assignment exists.
        //
        // We also keep track of whether at least one
        // authorized assignment is still within its
        // assignment-specific deadline.

        List<ClassroomEnrollment> enrollments =
                enrollmentRepository
                        .findByStudentId(studentId);

        boolean authorized = false;

        boolean deadlineValid = false;

        LocalDateTime now =
                LocalDateTime.now();

        if (enrollments != null) {

            for (ClassroomEnrollment enrollment :
                    enrollments) {

                if (enrollment == null) {
                    continue;
                }

                // -----------------------------------------
                // ACTIVE ENROLLMENT ONLY
                // -----------------------------------------

                if (!"ACTIVE".equalsIgnoreCase(
                        enrollment.getStatus())) {

                    continue;
                }

                // -----------------------------------------
                // CLASSROOM VALIDATION
                // -----------------------------------------

                if (
                        enrollment.getClassroom() == null ||
                        enrollment.getClassroom().getId() == null
                ) {

                    continue;
                }

                Long classroomId =
                        enrollment
                                .getClassroom()
                                .getId();

                // -----------------------------------------
                // FIND QUIZ ASSIGNMENT
                // -----------------------------------------

                QuizAssignment assignment =
                        assignmentRepository
                                .findByClassroomIdAndQuizId(
                                        classroomId,
                                        quizId
                                )
                                .orElse(null);

                if (assignment == null) {
                    continue;
                }

                // -----------------------------------------
                // ASSIGNMENT MUST BE ACTIVE
                // -----------------------------------------

                if (!"ACTIVE".equalsIgnoreCase(
                        assignment.getStatus())) {

                    continue;
                }

                // -------------------------------------------------
                // STUDENT IS AUTHORIZED FOR THIS QUIZ
                // -------------------------------------------------

                authorized = true;

                // -------------------------------------------------
                // CHECK ASSIGNMENT DEADLINE
                // -------------------------------------------------
                //
                // IMPORTANT:
                //
                // The deadline belongs to the assignment.
                // It starts from the time the teacher assigned
                // the quiz, not from the original quiz creation
                // time.
                //
                // If dueAt is null, we allow the assignment to
                // continue for backward compatibility with older
                // assignments created before dueAt was added.
                //
                // If dueAt exists, submission is allowed only
                // before the deadline.

                if (assignment.getDueAt() == null) {

                    deadlineValid = true;

                } else if (
                        now.isBefore(
                                assignment.getDueAt()
                        )
                ) {

                    deadlineValid = true;
                }

                // -------------------------------------------------
                // If one authorized assignment is still valid,
                // the student can submit.
                // -------------------------------------------------

                if (deadlineValid) {
                    break;
                }
            }
        }

        // -------------------------------------------------
        // VERIFY CLASSROOM AUTHORIZATION
        // -------------------------------------------------

        if (!authorized) {

            throw new RuntimeException(
                    "You are not authorized to submit this quiz"
            );
        }

        // -------------------------------------------------
        // VERIFY ASSIGNMENT DEADLINE
        // -------------------------------------------------

        if (!deadlineValid) {

            throw new RuntimeException(
                    "Quiz submission deadline has expired"
            );
        }

        // -------------------------------------------------
        // DUPLICATE SUBMISSION CHECK
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

            Integer selectedAnswer = null;

            if (answers != null) {

                selectedAnswer =
                        answers.get(
                                question.getId()
                        );
            }

            if (
                    selectedAnswer != null &&
                    selectedAnswer.equals(
                            question.getCorrectAnswer()
                    )
            ) {

                correctAnswers++;
            }
        }

        // -------------------------------------------------
        // TOTAL QUESTIONS
        // -------------------------------------------------

        int totalQuestions =
                questions.size();

        // -------------------------------------------------
        // CALCULATE PERCENTAGE
        // -------------------------------------------------

        int score =
                (int) Math.round(
                        (
                                (double) correctAnswers /
                                totalQuestions
                        ) *
                        100
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

        QuizAttempt savedAttempt =
                quizAttemptRepository.save(
                        attempt
                );

        // -------------------------------------------------
        // NOTIFY QUIZ TEACHER
        // -------------------------------------------------

        if (
                quiz.getCreatedBy() != null &&
                quiz.getCreatedBy().getId() != null
        ) {

            Notification notification =
                    notificationService.createNotification(
                            quiz.getCreatedBy().getId(),
                            "QUIZ",
                            "Quiz submitted",
                            "Student \"" +
                                    student.getName() +
                                    "\" submitted the quiz \"" +
                                    quiz.getTitle() +
                                    "\"."
                    );

            notification.setReferenceType(
                    "QUIZ"
            );

            notification.setReferenceId(
                    quiz.getId()
            );
        }

        return savedAttempt;
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
    // GET ALL ATTEMPTS FOR TEACHER
    // =====================================================

    public List<QuizAttempt> getTeacherAttempts(
            Long teacherId) {

        return quizAttemptRepository
                .findByQuizCreatedById(
                        teacherId
                );
    }

    // =====================================================
    // CHECK SUBMISSION
    // =====================================================

    public boolean hasStudentSubmitted(
            Long quizId,
            Long studentId) {

        return quizAttemptRepository
                .existsByQuizIdAndStudentId(
                        quizId,
                        studentId
                );
    }
}