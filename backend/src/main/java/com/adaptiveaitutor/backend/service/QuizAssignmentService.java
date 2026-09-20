package com.adaptiveaitutor.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.dto.ClassroomQuizResultResponse;
import com.adaptiveaitutor.backend.dto.QuizAssignmentResponse;
import com.adaptiveaitutor.backend.entity.Classroom;
import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.entity.Notification;
import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.QuizAssignment;
import com.adaptiveaitutor.backend.entity.QuizAttempt;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.entity.UserSettings;
import com.adaptiveaitutor.backend.repository.ClassroomEnrollmentRepository;
import com.adaptiveaitutor.backend.repository.ClassroomRepository;
import com.adaptiveaitutor.backend.repository.QuizAssignmentRepository;
import com.adaptiveaitutor.backend.repository.QuizAttemptRepository;
import com.adaptiveaitutor.backend.repository.QuizRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class QuizAssignmentService {

    private final QuizAssignmentRepository assignmentRepository;

    private final QuizAttemptRepository quizAttemptRepository;

    private final ClassroomRepository classroomRepository;

    private final QuizRepository quizRepository;

    private final ClassroomEnrollmentRepository enrollmentRepository;

    private final UserRepository userRepository;

    private final NotificationService notificationService;

    // Used to check the student's notification preferences.
    private final UserSettingsService userSettingsService;

    public QuizAssignmentService(
            QuizAssignmentRepository assignmentRepository,
            QuizAttemptRepository quizAttemptRepository,
            ClassroomRepository classroomRepository,
            QuizRepository quizRepository,
            ClassroomEnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            UserSettingsService userSettingsService) {

        this.assignmentRepository =
                assignmentRepository;

        this.quizAttemptRepository =
                quizAttemptRepository;

        this.classroomRepository =
                classroomRepository;

        this.quizRepository =
                quizRepository;

        this.enrollmentRepository =
                enrollmentRepository;

        this.userRepository =
                userRepository;

        this.notificationService =
                notificationService;

        this.userSettingsService =
                userSettingsService;
    }

    // =====================================================
    // ASSIGN QUIZ TO CLASSROOM
    // =====================================================

    @Transactional
    public QuizAssignment assignQuizToClassroom(
            Long classroomId,
            Long quizId,
            Long teacherId) {

        // -------------------------------------------------
        // FIND CLASSROOM
        // -------------------------------------------------

        Classroom classroom =
                classroomRepository
                        .findById(classroomId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Classroom not found"
                                )
                        );

        // -------------------------------------------------
        // VERIFY TEACHER
        // -------------------------------------------------

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
                    "Only teachers can assign quizzes"
            );
        }

        // -------------------------------------------------
        // VERIFY CLASSROOM OWNER
        // -------------------------------------------------

        if (
                classroom.getTeacher() == null ||
                classroom.getTeacher().getId() == null ||
                !classroom.getTeacher()
                        .getId()
                        .equals(teacherId)
        ) {

            throw new RuntimeException(
                    "You are not authorized to manage this classroom"
            );
        }

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
        // VERIFY QUIZ OWNER
        // -------------------------------------------------

        if (
                quiz.getCreatedBy() == null ||
                quiz.getCreatedBy().getId() == null ||
                !quiz.getCreatedBy()
                        .getId()
                        .equals(teacherId)
        ) {

            throw new RuntimeException(
                    "You can only assign quizzes created by you"
            );
        }

        // -------------------------------------------------
        // CHECK DUPLICATE ASSIGNMENT
        // -------------------------------------------------

        if (
                assignmentRepository
                        .existsByClassroomIdAndQuizId(
                                classroomId,
                                quizId
                        )
        ) {

            throw new RuntimeException(
                    "This quiz is already assigned to this classroom"
            );
        }

        // -------------------------------------------------
        // CREATE ASSIGNMENT
        // -------------------------------------------------

        QuizAssignment assignment =
                new QuizAssignment(
                        classroom,
                        quiz
                );

        QuizAssignment savedAssignment =
                assignmentRepository.save(
                        assignment
                );

        // -------------------------------------------------
        // NOTIFY ACTIVE STUDENTS
        // -------------------------------------------------

        List<ClassroomEnrollment> enrollments =
                enrollmentRepository.findByClassroomId(
                        classroomId
                );

        for (ClassroomEnrollment enrollment :
                enrollments) {

            if (
                    enrollment != null &&
                    "ACTIVE".equalsIgnoreCase(
                            enrollment.getStatus()
                    ) &&
                    enrollment.getStudent() != null &&
                    enrollment.getStudent().getId() != null
            ) {

                Long studentId =
                        enrollment.getStudent().getId();

                // -----------------------------------------
                // CHECK STUDENT NOTIFICATION SETTINGS
                // -----------------------------------------
                //
                // If Quiz Reminders are OFF, do not create
                // the "New quiz assigned" notification.
                //
                // getOrCreateSettings() also creates default
                // settings for users who do not have a record.
                // The default value of quizReminders is TRUE.
                // -----------------------------------------

                UserSettings settings =
                        userSettingsService
                                .getOrCreateSettings(studentId);

                if (!Boolean.TRUE.equals(
                        settings.getQuizReminders()
                )) {

                    continue;
                }

                // -----------------------------------------
                // CREATE QUIZ ASSIGNMENT NOTIFICATION
                // -----------------------------------------

                Notification notification =
                        notificationService.createNotification(
                                studentId,
                                "QUIZ",
                                "New quiz assigned",
                                "A new quiz \"" +
                                        quiz.getTitle() +
                                        "\" has been assigned to your classroom."
                        );

                notification.setReferenceType(
                        "QUIZ"
                );

                notification.setReferenceId(
                        quiz.getId()
                );
            }
        }

        return savedAssignment;
    }

    // =====================================================
    // GET CLASSROOM ASSIGNED QUIZZES
    // =====================================================

    public List<QuizAssignmentResponse> getClassroomQuizzes(
            Long classroomId,
            Long teacherId) {

        Classroom classroom =
                verifyTeacherOwnsClassroom(
                        classroomId,
                        teacherId
                );

        return assignmentRepository
                .findByClassroomIdAndStatus(
                        classroom.getId(),
                        "ACTIVE"
                )
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // GET CLASSROOM RESULTS
    // =====================================================

    public List<ClassroomQuizResultResponse> getClassroomResults(
            Long classroomId,
            Long teacherId) {

        Classroom classroom =
                verifyTeacherOwnsClassroom(
                        classroomId,
                        teacherId
                );

        List<ClassroomEnrollment> enrollments =
                enrollmentRepository.findByClassroomId(
                        classroomId
                );

        List<QuizAssignment> assignments =
                assignmentRepository
                        .findByClassroomIdAndStatus(
                                classroomId,
                                "ACTIVE"
                        );

        List<ClassroomQuizResultResponse> results =
                new ArrayList<>();

        for (QuizAssignment assignment :
                assignments) {

            if (
                    assignment == null ||
                    assignment.getQuiz() == null
            ) {

                continue;
            }

            List<QuizAttempt> attempts =
                    quizAttemptRepository.findByQuizId(
                            assignment.getQuiz().getId()
                    );

            for (ClassroomEnrollment enrollment :
                    enrollments) {

                if (
                        enrollment == null ||
                        !"ACTIVE".equalsIgnoreCase(
                                enrollment.getStatus()
                        ) ||
                        enrollment.getStudent() == null
                ) {

                    continue;
                }

                User student =
                        enrollment.getStudent();

                QuizAttempt studentAttempt =
                        null;

                for (QuizAttempt attempt :
                        attempts) {

                    if (
                            attempt != null &&
                            attempt.getStudent() != null &&
                            attempt.getStudent().getId() != null &&
                            attempt.getStudent()
                                    .getId()
                                    .equals(student.getId())
                    ) {

                        studentAttempt =
                                attempt;

                        break;
                    }
                }

                results.add(
                        new ClassroomQuizResultResponse(
                                assignment.getId(),

                                classroom.getId(),

                                classroom.getName(),

                                assignment.getQuiz().getId(),

                                assignment.getQuiz().getTitle(),

                                student.getId(),

                                student.getName(),

                                student.getEmail(),

                                studentAttempt == null
                                        ? "NOT_SUBMITTED"
                                        : "SUBMITTED",

                                studentAttempt == null
                                        ? null
                                        : studentAttempt.getScore(),

                                studentAttempt == null
                                        ? null
                                        : studentAttempt.getTotalQuestions(),

                                studentAttempt == null
                                        ? null
                                        : studentAttempt.getCorrectAnswers(),

                                studentAttempt == null
                                        ? null
                                        : studentAttempt.getSubmittedAt()
                        )
                );
            }
        }

        results.sort(
                (first, second) -> {

                    int quizCompare =
                            String.valueOf(
                                    first.getQuizTitle()
                            )
                            .compareToIgnoreCase(
                                    String.valueOf(
                                            second.getQuizTitle()
                                    )
                            );

                    if (quizCompare != 0) {

                        return quizCompare;
                    }

                    return String.valueOf(
                            first.getStudentName()
                    )
                    .compareToIgnoreCase(
                            String.valueOf(
                                    second.getStudentName()
                            )
                    );
                }
        );

        return results;
    }

    // =====================================================
    // GET STUDENT ASSIGNED QUIZZES
    // =====================================================

    public List<QuizAssignmentResponse> getStudentQuizzes(
            Long studentId) {

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
                student.getRole()
        )) {

            throw new RuntimeException(
                    "Only students can access assigned quizzes"
            );
        }

        // -------------------------------------------------
        // GET ENROLLMENTS
        // -------------------------------------------------

        List<ClassroomEnrollment> enrollments =
                enrollmentRepository
                        .findByStudentId(studentId);

        if (
                enrollments == null ||
                enrollments.isEmpty()
        ) {

            return Collections.emptyList();
        }

        // -------------------------------------------------
        // GET ACTIVE CLASSROOM IDS
        // -------------------------------------------------

        List<Long> classroomIds =
                enrollments
                        .stream()
                        .filter(
                                enrollment ->
                                        enrollment != null &&
                                        "ACTIVE".equalsIgnoreCase(
                                                enrollment.getStatus()
                                        ) &&
                                        enrollment.getClassroom() != null &&
                                        enrollment.getClassroom().getId() != null
                        )
                        .map(
                                enrollment ->
                                        enrollment
                                                .getClassroom()
                                                .getId()
                        )
                        .distinct()
                        .collect(Collectors.toList());

        if (classroomIds.isEmpty()) {

            return Collections.emptyList();
        }

        // -------------------------------------------------
        // GET ACTIVE ASSIGNMENTS
        // -------------------------------------------------

        return assignmentRepository
                .findByClassroomIdInAndStatus(
                        classroomIds,
                        "ACTIVE"
                )
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // GET ONE STUDENT QUIZ
    // =====================================================

    public QuizAssignmentResponse getStudentQuiz(
            Long classroomId,
            Long quizId,
            Long studentId) {

        // -------------------------------------------------
        // VERIFY STUDENT
        // -------------------------------------------------

        User student =
                userRepository
                        .findById(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student not found"
                                )
                        );

        if (!"student".equalsIgnoreCase(
                student.getRole()
        )) {

            throw new RuntimeException(
                    "Only students can access quizzes"
            );
        }

        // -------------------------------------------------
        // VERIFY ENROLLMENT
        // -------------------------------------------------

        boolean enrolled =
                enrollmentRepository
                        .existsByClassroomIdAndStudentId(
                                classroomId,
                                studentId
                        );

        if (!enrolled) {

            throw new RuntimeException(
                    "Student is not enrolled in this classroom"
            );
        }

        // -------------------------------------------------
        // FIND ASSIGNMENT
        // -------------------------------------------------

        QuizAssignment assignment =
                assignmentRepository
                        .findByClassroomIdAndQuizId(
                                classroomId,
                                quizId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Quiz is not assigned to this classroom"
                                )
                        );

        // -------------------------------------------------
        // CHECK STATUS
        // -------------------------------------------------

        if (!"ACTIVE".equalsIgnoreCase(
                assignment.getStatus()
        )) {

            throw new RuntimeException(
                    "This quiz assignment is no longer active"
            );
        }

        return toResponse(
                assignment
        );
    }

    // =====================================================
    // REMOVE QUIZ FROM CLASSROOM
    // =====================================================

    @Transactional
    public void removeQuizFromClassroom(
            Long classroomId,
            Long quizId,
            Long teacherId) {

        verifyTeacherOwnsClassroom(
                classroomId,
                teacherId
        );

        QuizAssignment assignment =
                assignmentRepository
                        .findByClassroomIdAndQuizId(
                                classroomId,
                                quizId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Quiz is not assigned to this classroom"
                                )
                        );

        assignment.setStatus(
                "INACTIVE"
        );

        assignmentRepository.save(
                assignment
        );
    }

    // =====================================================
    // VERIFY CLASSROOM OWNER
    // =====================================================

    private Classroom verifyTeacherOwnsClassroom(
            Long classroomId,
            Long teacherId) {

        Classroom classroom =
                classroomRepository
                        .findById(classroomId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Classroom not found"
                                )
                        );

        User teacher =
                userRepository
                        .findById(teacherId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher not found"
                                )
                        );

        if (!"teacher".equalsIgnoreCase(
                teacher.getRole()
        )) {

            throw new RuntimeException(
                    "Only teachers can manage classroom quizzes"
            );
        }

        if (
                classroom.getTeacher() == null ||
                classroom.getTeacher().getId() == null ||
                !classroom.getTeacher()
                        .getId()
                        .equals(teacherId)
        ) {

            throw new RuntimeException(
                    "You are not authorized to manage this classroom"
            );
        }

        return classroom;
    }

    // =====================================================
    // CALCULATE EFFECTIVE ASSIGNMENT DEADLINE
    // =====================================================

    /*
     * New assignments:
     *     assignment.dueAt already exists.
     *
     * Old assignments:
     *     assignment.dueAt is NULL because the column was
     *     added later.
     *
     * For old assignments we calculate:
     *
     *     assignedAt + original quiz deadline duration
     */

    private LocalDateTime getEffectiveDueAt(
            QuizAssignment assignment) {

        // -------------------------------------------------
        // NEW ASSIGNMENT
        // -------------------------------------------------

        if (
                assignment != null &&
                assignment.getDueAt() != null
        ) {

            return assignment.getDueAt();
        }

        // -------------------------------------------------
        // VALIDATE OLD ASSIGNMENT
        // -------------------------------------------------

        if (
                assignment == null ||
                assignment.getAssignedAt() == null ||
                assignment.getQuiz() == null ||
                assignment.getQuiz().getCreatedAt() == null ||
                assignment.getQuiz().getDueAt() == null
        ) {

            return null;
        }

        // -------------------------------------------------
        // CALCULATE ORIGINAL QUIZ DEADLINE DURATION
        // -------------------------------------------------

        Duration deadlineDuration =
                Duration.between(
                        assignment
                                .getQuiz()
                                .getCreatedAt(),

                        assignment
                                .getQuiz()
                                .getDueAt()
                );

        // -------------------------------------------------
        // APPLY DURATION TO ASSIGNMENT TIME
        // -------------------------------------------------

        return assignment
                .getAssignedAt()
                .plus(deadlineDuration);
    }

    // =====================================================
    // RESPONSE MAPPER
    // =====================================================

    private QuizAssignmentResponse toResponse(
            QuizAssignment assignment) {

        Quiz quiz =
                assignment.getQuiz();

        Classroom classroom =
                assignment.getClassroom();

        Long subjectId =
                null;

        String subjectName =
                null;

        Long topicId =
                null;

        String topicName =
                null;

        if (quiz != null) {

            if (quiz.getSubject() != null) {

                subjectId =
                        quiz.getSubject().getId();

                subjectName =
                        quiz.getSubject().getName();
            }

            if (quiz.getTopic() != null) {

                topicId =
                        quiz.getTopic().getId();

                topicName =
                        quiz.getTopic().getTitle();
            }
        }

        return new QuizAssignmentResponse(
                assignment.getId(),

                classroom != null
                        ? classroom.getId()
                        : null,

                classroom != null
                        ? classroom.getName()
                        : null,

                quiz != null
                        ? quiz.getId()
                        : null,

                quiz != null
                        ? quiz.getTitle()
                        : null,

                quiz != null
                        ? quiz.getDuration()
                        : null,

                // Assignment-specific deadline
                getEffectiveDueAt(
                        assignment
                ),

                assignment.getAssignedAt(),

                assignment.getStatus(),

                subjectId,

                subjectName,

                topicId,

                topicName
        );
    }
}