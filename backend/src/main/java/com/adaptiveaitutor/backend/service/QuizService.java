package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.QuizQuestion;
import com.adaptiveaitutor.backend.entity.Subject;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.QuizAttemptRepository;
import com.adaptiveaitutor.backend.repository.QuizQuestionRepository;
import com.adaptiveaitutor.backend.repository.QuizRepository;
import com.adaptiveaitutor.backend.repository.SubjectRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class QuizService {

    private final QuizRepository quizRepository;

    private final QuizQuestionRepository quizQuestionRepository;

    private final QuizAttemptRepository quizAttemptRepository;

    private final SubjectRepository subjectRepository;

    private final UserRepository userRepository;

    public QuizService(
            QuizRepository quizRepository,
            QuizQuestionRepository quizQuestionRepository,
            QuizAttemptRepository quizAttemptRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository) {

        this.quizRepository =
                quizRepository;

        this.quizQuestionRepository =
                quizQuestionRepository;

        this.quizAttemptRepository =
                quizAttemptRepository;

        this.subjectRepository =
                subjectRepository;

        this.userRepository =
                userRepository;
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
        // VALIDATE DEADLINE
        // -------------------------------------------------

        if (
                deadlineHours == null ||
                (
                    deadlineHours != 12 &&
                    deadlineHours != 24 &&
                    deadlineHours != 48
                )
        ) {

            throw new RuntimeException(
                    "Deadline must be 12, 24, or 48 hours"
            );
        }

        // -------------------------------------------------
        // FIND SUBJECT
        // -------------------------------------------------

        Subject subject =
                subjectRepository
                        .findById(subjectId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Subject not found"
                                        )
                        );

        // -------------------------------------------------
        // FIND TEACHER
        // -------------------------------------------------

        User teacher =
                userRepository
                        .findById(teacherId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Teacher not found"
                                        )
                        );

        // -------------------------------------------------
        // VERIFY TEACHER ROLE
        // -------------------------------------------------

        if (
                !"teacher".equalsIgnoreCase(
                        teacher.getRole()
                )
        ) {

            throw new RuntimeException(
                    "Only teachers can create quizzes"
            );
        }

        // -------------------------------------------------
        // VALIDATE TITLE
        // -------------------------------------------------

        if (
                title == null ||
                title.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Quiz title cannot be empty"
            );
        }

        // -------------------------------------------------
        // VALIDATE DURATION
        // -------------------------------------------------

        if (
                duration == null ||
                duration < 1
        ) {

            throw new RuntimeException(
                    "Quiz duration must be at least 1 minute"
            );
        }

        // -------------------------------------------------
        // CREATE QUIZ
        // -------------------------------------------------

        Quiz quiz =
                new Quiz(
                        title.trim(),
                        duration,
                        subject,
                        teacher
                );

        // -------------------------------------------------
        // SET CREATION + DEADLINE
        // -------------------------------------------------

        LocalDateTime createdAt =
                LocalDateTime.now();

        LocalDateTime dueAt =
                createdAt.plusHours(
                        deadlineHours
                );

        quiz.setCreatedAt(
                createdAt
        );

        quiz.setDueAt(
                dueAt
        );

        // -------------------------------------------------
        // SAVE QUIZ
        // -------------------------------------------------

        return quizRepository.save(
                quiz
        );
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

    public Quiz getQuiz(
            Long quizId) {

        return quizRepository
                .findById(quizId)
                .orElseThrow(
                        () ->
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

        // Make sure quiz exists first.
        getQuiz(quizId);

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
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Quiz not found"
                                        )
                        );

        // -------------------------------------------------
        // VALIDATE QUESTION
        // -------------------------------------------------

        if (
                question == null ||
                question.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Question cannot be empty"
            );
        }

        if (
                option1 == null ||
                option1.trim().isEmpty() ||
                option2 == null ||
                option2.trim().isEmpty() ||
                option3 == null ||
                option3.trim().isEmpty() ||
                option4 == null ||
                option4.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "All four options are required"
            );
        }

        // -------------------------------------------------
        // VALIDATE CORRECT ANSWER
        // -------------------------------------------------

        if (
                correctAnswer == null ||
                correctAnswer < 0 ||
                correctAnswer > 3
        ) {

            throw new RuntimeException(
                    "Correct answer must be between 0 and 3"
            );
        }

        // -------------------------------------------------
        // CREATE QUESTION
        // -------------------------------------------------

        QuizQuestion quizQuestion =
                new QuizQuestion(
                        question.trim(),
                        option1.trim(),
                        option2.trim(),
                        option3.trim(),
                        option4.trim(),
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
                .findByCreatedById(
                        teacherId
                );
    }

    // =====================================================
    // GET SUBJECT QUIZZES
    // =====================================================

    public List<Quiz> getSubjectQuizzes(
            Long subjectId) {

        return quizRepository
                .findBySubjectId(
                        subjectId
                );
    }

    // =====================================================
    // DELETE QUIZ
    // =====================================================

    @Transactional
    public boolean deleteQuiz(
            Long quizId) {

        // -------------------------------------------------
        // FIND QUIZ
        // -------------------------------------------------

        Quiz quiz =
                quizRepository
                        .findById(quizId)
                        .orElse(null);

        if (quiz == null) {

            return false;
        }

        // -------------------------------------------------
        // PROTECT STUDENT RESULTS
        // -------------------------------------------------

        boolean hasAttempts =
                quizAttemptRepository
                        .existsByQuizId(
                                quizId
                        );

        if (hasAttempts) {

            throw new RuntimeException(
                    "This quiz cannot be deleted because students have already submitted it."
            );
        }

        // -------------------------------------------------
        // DELETE QUIZ
        // -------------------------------------------------
        //
        // Quiz.questions uses CascadeType.ALL and
        // orphanRemoval=true, so associated questions
        // are removed with the quiz.
        //
        // No student attempts exist at this point.
        // -------------------------------------------------

        quizRepository.delete(
                quiz
        );

        return true;
    }
}