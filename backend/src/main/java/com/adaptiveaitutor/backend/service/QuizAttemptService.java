package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.QuizAttempt;
import com.adaptiveaitutor.backend.entity.QuizQuestion;
import com.adaptiveaitutor.backend.entity.User;
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

    public QuizAttemptService(
            QuizAttemptRepository quizAttemptRepository,
            QuizRepository quizRepository,
            QuizQuestionRepository quizQuestionRepository,
            UserRepository userRepository) {

        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // SUBMIT QUIZ
    // =====================================================

    public QuizAttempt submitQuiz(
            Long quizId,
            Long studentId,
            Map<Long, Integer> answers) {

        // -------------------------------------------------
        // 1. FIND QUIZ
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
        // 2. CHECK QUIZ DEADLINE
        // -------------------------------------------------

        LocalDateTime dueAt =
                quiz.getDueAt();

        if (dueAt != null &&
                LocalDateTime.now().isAfter(dueAt)) {

            throw new RuntimeException(
                    "Quiz submission deadline has expired"
            );
        }

        // -------------------------------------------------
        // 3. FIND STUDENT
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
        // 4. VERIFY STUDENT ROLE
        // -------------------------------------------------

        if (!"student".equalsIgnoreCase(
                student.getRole())) {

            throw new RuntimeException(
                    "Only students can submit quizzes"
            );
        }

        // -------------------------------------------------
        // 5. CHECK DUPLICATE SUBMISSION
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
        // 6. GET QUESTIONS
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
        // 7. CALCULATE SCORE
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

        // -------------------------------------------------
        // 8. TOTAL QUESTIONS
        // -------------------------------------------------

        int totalQuestions =
                questions.size();

        // -------------------------------------------------
        // 9. CALCULATE PERCENTAGE
        // -------------------------------------------------

        int score =
                (int) Math.round(
                        ((double) correctAnswers /
                                totalQuestions) * 100
                );

        // -------------------------------------------------
        // 10. CREATE ATTEMPT
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
        // 11. SAVE ATTEMPT
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
}