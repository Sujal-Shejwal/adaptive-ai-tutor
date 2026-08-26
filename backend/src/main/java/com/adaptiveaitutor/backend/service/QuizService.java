package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.QuizQuestion;
import com.adaptiveaitutor.backend.entity.Subject;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.QuizQuestionRepository;
import com.adaptiveaitutor.backend.repository.QuizRepository;
import com.adaptiveaitutor.backend.repository.SubjectRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public QuizService(
            QuizRepository quizRepository,
            QuizQuestionRepository quizQuestionRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository) {

        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE QUIZ
    // =====================================================

    public Quiz createQuiz(
            String title,
            Integer duration,
            Long subjectId,
            Long teacherId,
            Integer deadlineHours) {

        // -------------------------------------------------
        // Validate deadline
        // -------------------------------------------------

        if (deadlineHours == null ||
                (deadlineHours != 12 &&
                 deadlineHours != 24 &&
                 deadlineHours != 48)) {

            throw new RuntimeException(
                    "Deadline must be 12, 24, or 48 hours"
            );
        }

        // -------------------------------------------------
        // Find subject
        // -------------------------------------------------

        Subject subject =
                subjectRepository
                        .findById(subjectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Subject not found"
                                )
                        );

        // -------------------------------------------------
        // Find teacher
        // -------------------------------------------------

        User teacher =
                userRepository
                        .findById(teacherId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher not found"
                                )
                        );

        // -------------------------------------------------
        // Verify teacher role
        // -------------------------------------------------

        if (!"teacher".equalsIgnoreCase(
                teacher.getRole())) {

            throw new RuntimeException(
                    "Only teachers can create quizzes"
            );
        }

        // -------------------------------------------------
        // Create quiz
        // -------------------------------------------------

        Quiz quiz =
                new Quiz(
                        title,
                        duration,
                        subject,
                        teacher
                );

        // -------------------------------------------------
        // Set creation and deadline time
        // -------------------------------------------------

        LocalDateTime createdAt =
                LocalDateTime.now();

        LocalDateTime dueAt =
                createdAt.plusHours(
                        deadlineHours
                );

        quiz.setCreatedAt(createdAt);

        quiz.setDueAt(dueAt);

        // -------------------------------------------------
        // Save quiz
        // -------------------------------------------------

        return quizRepository.save(quiz);
    }

    // =====================================================
    // GET ALL QUIZZES
    // =====================================================

    public List<Quiz> getAllQuizzes() {

        return quizRepository.findAll();
    }

    // =====================================================
    // GET QUIZ
    // =====================================================

    public Quiz getQuiz(Long quizId) {

        return quizRepository
                .findById(quizId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Quiz not found"
                        )
                );
    }

    // =====================================================
    // GET QUIZ QUESTIONS
    // =====================================================

    public List<QuizQuestion> getQuestions(
            Long quizId) {

        return quizQuestionRepository
                .findByQuizId(quizId);
    }

    // =====================================================
    // ADD QUESTION
    // =====================================================

    public QuizQuestion addQuestion(
            Long quizId,
            String question,
            String option1,
            String option2,
            String option3,
            String option4,
            Integer correctAnswer) {

        Quiz quiz =
                quizRepository
                        .findById(quizId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Quiz not found"
                                )
                        );

        if (correctAnswer == null ||
                correctAnswer < 0 ||
                correctAnswer > 3) {

            throw new RuntimeException(
                    "Correct answer must be between 0 and 3"
            );
        }

        QuizQuestion quizQuestion =
                new QuizQuestion(
                        question,
                        option1,
                        option2,
                        option3,
                        option4,
                        correctAnswer,
                        quiz
                );

        return quizQuestionRepository.save(
                quizQuestion
        );
    }

    // =====================================================
    // GET TEACHER QUIZZES
    // =====================================================

    public List<Quiz> getTeacherQuizzes(
            Long teacherId) {

        return quizRepository
                .findByCreatedById(teacherId);
    }

    // =====================================================
    // GET SUBJECT QUIZZES
    // =====================================================

    public List<Quiz> getSubjectQuizzes(
            Long subjectId) {

        return quizRepository
                .findBySubjectId(subjectId);
    }
}