package com.adaptiveaitutor.backend.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.QuizAttempt;
import com.adaptiveaitutor.backend.repository.NoteRepository;
import com.adaptiveaitutor.backend.repository.QuizAttemptRepository;
import com.adaptiveaitutor.backend.repository.QuizRepository;
import com.adaptiveaitutor.backend.repository.SubjectRepository;
import com.adaptiveaitutor.backend.repository.TopicProgressRepository;
import com.adaptiveaitutor.backend.repository.TopicRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class DashboardStatisticsService {

    private final TopicProgressRepository topicProgressRepository;
    private final TopicRepository topicRepository;
    private final NoteRepository noteRepository;

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final SubjectRepository subjectRepository;

    public DashboardStatisticsService(
            TopicProgressRepository topicProgressRepository,
            TopicRepository topicRepository,
            NoteRepository noteRepository,
            UserRepository userRepository,
            QuizRepository quizRepository,
            QuizAttemptRepository quizAttemptRepository,
            SubjectRepository subjectRepository) {

        this.topicProgressRepository =
                topicProgressRepository;

        this.topicRepository =
                topicRepository;

        this.noteRepository =
                noteRepository;

        this.userRepository =
                userRepository;

        this.quizRepository =
                quizRepository;

        this.quizAttemptRepository =
                quizAttemptRepository;

        this.subjectRepository =
                subjectRepository;
    }

    // =====================================================
    // GET DASHBOARD STATISTICS
    // =====================================================

    public Map<String, Object> getStatistics(
            Long userId) {

        // -------------------------------------------------
        // TOTAL STUDENTS
        // -------------------------------------------------

        long totalStudents =
                userRepository
                        .countByRoleIgnoreCase(
                                "student"
                        );

        // -------------------------------------------------
        // TOTAL NOTES
        // -------------------------------------------------

        long learningMaterials =
                noteRepository.count();

        // -------------------------------------------------
        // TOTAL SUBJECTS
        // -------------------------------------------------

        long totalSubjects =
                subjectRepository.count();

        // -------------------------------------------------
        // TOTAL QUIZZES
        // -------------------------------------------------

        long totalQuizzes =
                quizRepository.count();

        // -------------------------------------------------
        // ALL QUIZ ATTEMPTS
        // -------------------------------------------------

        List<QuizAttempt> attempts =
                quizAttemptRepository.findAll();

        // -------------------------------------------------
        // AVERAGE QUIZ SCORE
        // -------------------------------------------------

        double averageScore = 0;

        if (!attempts.isEmpty()) {

            double totalScore =
                    attempts.stream()
                            .mapToDouble(
                                    attempt ->
                                            NumberUtils
                                                    .safeScore(
                                                            attempt.getScore()
                                                    )
                            )
                            .sum();

            averageScore =
                    totalScore /
                    attempts.size();
        }

        int roundedAverageScore =
                (int) Math.round(
                        averageScore
                );

        // -------------------------------------------------
        // COMPLETED TOPICS
        // -------------------------------------------------

        long completedTopics =
                topicProgressRepository
                        .countByUserIdAndCompletedTrue(
                                userId
                        );

        // -------------------------------------------------
        // TOTAL TOPICS
        // -------------------------------------------------

        long totalTopics =
                topicRepository.count();

        // -------------------------------------------------
        // CURRENT USER PROGRESS
        // -------------------------------------------------

        int overallProgress = 0;

        if (totalTopics > 0) {

            overallProgress =
                    (int) Math.round(
                            (
                                completedTopics * 100.0
                            ) /
                            totalTopics
                    );
        }

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        Map<String, Object> statistics =
                new LinkedHashMap<>();

        statistics.put(
                "totalStudents",
                totalStudents
        );

        statistics.put(
                "learningMaterials",
                learningMaterials
        );

        statistics.put(
                "totalSubjects",
                totalSubjects
        );

        statistics.put(
                "totalQuizzes",
                totalQuizzes
        );

        statistics.put(
                "averageQuizScore",
                roundedAverageScore
        );

        statistics.put(
                "completedTopics",
                completedTopics
        );

        statistics.put(
                "totalTopics",
                totalTopics
        );

        statistics.put(
                "overallProgress",
                overallProgress
        );

        return statistics;
    }

    // =====================================================
    // SMALL HELPER
    // =====================================================

    private static class NumberUtils {

        private NumberUtils() {
        }

        static double safeScore(
                Integer score) {

            return score == null
                    ? 0
                    : score.doubleValue();
        }
    }
}