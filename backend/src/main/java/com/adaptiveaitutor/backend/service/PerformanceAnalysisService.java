package com.adaptiveaitutor.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.QuizAttempt;
import com.adaptiveaitutor.backend.entity.Topic;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.QuizAttemptRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class PerformanceAnalysisService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;

    public PerformanceAnalysisService(
            QuizAttemptRepository quizAttemptRepository,
            UserRepository userRepository) {

        this.quizAttemptRepository =
                quizAttemptRepository;

        this.userRepository =
                userRepository;
    }

    // =====================================================
    // ANALYZE STUDENT PERFORMANCE
    // =====================================================

    public PerformanceAnalysis analyzeStudentPerformance(
            Long studentId) {

        // -------------------------------------------------
        // FIND STUDENT
        // -------------------------------------------------

        User student =
                userRepository
                        .findById(studentId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Student not found"
                                        )
                        );

        // -------------------------------------------------
        // VERIFY STUDENT ROLE
        // -------------------------------------------------

        if (
                !"student".equalsIgnoreCase(
                        student.getRole()
                )
        ) {

            throw new RuntimeException(
                    "Performance analysis is available only for students."
            );
        }

        // -------------------------------------------------
        // GET ALL ATTEMPTS
        // -------------------------------------------------

        List<QuizAttempt> attempts =
                quizAttemptRepository
                        .findByStudentId(
                                studentId
                        );

        // -------------------------------------------------
        // EMPTY PERFORMANCE
        // -------------------------------------------------

        if (
                attempts == null ||
                attempts.isEmpty()
        ) {

            return new PerformanceAnalysis(
                    studentId,
                    student.getName(),
                    0,
                    0,
                    0,
                    new ArrayList<>(),
                    new ArrayList<>(),
                    new ArrayList<>()
            );
        }

        // =================================================
        // OVERALL PERFORMANCE
        // =================================================

        int totalQuizzes =
                attempts.size();

        double totalScore =
                0.0;

        int totalCorrectAnswers =
                0;

        for (
                QuizAttempt attempt :
                attempts
        ) {

            if (attempt.getScore() != null) {

                totalScore +=
                        attempt.getScore();
            }

            if (attempt.getCorrectAnswers() != null) {

                totalCorrectAnswers +=
                        attempt.getCorrectAnswers();
            }
        }

        double averageScore =
                totalScore / totalQuizzes;

        // =================================================
        // QUIZ PERFORMANCE
        // =================================================

        List<QuizPerformance> quizPerformance =
                new ArrayList<>();

        // =================================================
        // TOPIC SCORE GROUPING
        // =================================================

        Map<Long, TopicPerformanceAccumulator>
                topicMap =
                        new LinkedHashMap<>();

        for (
                QuizAttempt attempt :
                attempts
        ) {

            Quiz quiz =
                    attempt.getQuiz();

            if (quiz == null) {

                continue;
            }

            // -------------------------------------------------
            // SUBJECT NAME
            // -------------------------------------------------

            String subjectName = null;

            if (quiz.getSubject() != null) {

                subjectName =
                        quiz.getSubject()
                                .getName();
            }

            // -------------------------------------------------
            // TOPIC INFORMATION
            // -------------------------------------------------

            Long topicId = null;
            String topicName = null;

            if (quiz.getTopic() != null) {

                Topic topic =
                        quiz.getTopic();

                topicId =
                        topic.getId();

                topicName =
                        topic.getTitle();
            }

            // -------------------------------------------------
            // ADD QUIZ PERFORMANCE
            // -------------------------------------------------

            quizPerformance.add(
                    new QuizPerformance(
                            quiz.getId(),
                            quiz.getTitle(),
                            subjectName,
                            topicId,
                            topicName,
                            attempt.getScore(),
                            attempt.getCorrectAnswers(),
                            attempt.getTotalQuestions(),
                            attempt.getSubmittedAt()
                    )
            );

            // -------------------------------------------------
            // SKIP QUIZZES WITHOUT TOPIC
            // -------------------------------------------------

            if (
                    topicId == null ||
                    quiz.getTopic() == null
            ) {

                continue;
            }

            // -------------------------------------------------
            // GET EXISTING TOPIC ACCUMULATOR
            // -------------------------------------------------

            TopicPerformanceAccumulator accumulator =
                    topicMap.get(topicId);

            // -------------------------------------------------
            // CREATE ACCUMULATOR IF NEEDED
            // -------------------------------------------------

            if (accumulator == null) {

                accumulator =
                        new TopicPerformanceAccumulator(
                                topicId,
                                topicName,
                                subjectName
                        );

                topicMap.put(
                        topicId,
                        accumulator
                );
            }

            // -------------------------------------------------
            // ADD ATTEMPT TO TOPIC
            // -------------------------------------------------

            accumulator.addAttempt(
                    attempt
            );
        }

        // =================================================
        // CREATE TOPIC PERFORMANCE RESULT
        // =================================================

        List<TopicPerformance> topicPerformance =
                new ArrayList<>();

        for (
                TopicPerformanceAccumulator accumulator :
                topicMap.values()
        ) {

            topicPerformance.add(
                    accumulator.toTopicPerformance()
            );
        }

        // -------------------------------------------------
        // SORT LOWEST FIRST
        // -------------------------------------------------

        topicPerformance.sort(
                Comparator.comparingDouble(
                        TopicPerformance::getAverageScore
                )
        );

        // =================================================
        // DETECT WEAK TOPICS
        // =================================================

        List<TopicPerformance> weakTopics =
                topicPerformance.stream()
                        .filter(
                                topic ->
                                        topic.getAverageScore()
                                                < 60
                        )
                        .toList();

        // =================================================
        // DETECT STRONG TOPICS
        // =================================================

        List<TopicPerformance> strongTopics =
                topicPerformance.stream()
                        .filter(
                                topic ->
                                        topic.getAverageScore()
                                                >= 80
                        )
                        .sorted(
                                Comparator.comparingDouble(
                                        TopicPerformance::getAverageScore
                                ).reversed()
                        )
                        .toList();

        // =================================================
        // FINAL RESULT
        // =================================================

        return new PerformanceAnalysis(
                studentId,
                student.getName(),
                round(averageScore),
                totalQuizzes,
                totalCorrectAnswers,
                quizPerformance,
                weakTopics,
                strongTopics
        );
    }

    // =====================================================
    // ROUND NUMBER
    // =====================================================

    private double round(
            double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }

    // =====================================================
    // PERFORMANCE ANALYSIS RESPONSE
    // =====================================================

    public static class PerformanceAnalysis {

        private final Long studentId;

        private final String studentName;

        private final double averageScore;

        private final int totalQuizzes;

        private final int totalCorrectAnswers;

        private final List<QuizPerformance> quizPerformance;

        private final List<TopicPerformance> weakTopics;

        private final List<TopicPerformance> strongTopics;

        public PerformanceAnalysis(
                Long studentId,
                String studentName,
                double averageScore,
                int totalQuizzes,
                int totalCorrectAnswers,
                List<QuizPerformance> quizPerformance,
                List<TopicPerformance> weakTopics,
                List<TopicPerformance> strongTopics) {

            this.studentId =
                    studentId;

            this.studentName =
                    studentName;

            this.averageScore =
                    averageScore;

            this.totalQuizzes =
                    totalQuizzes;

            this.totalCorrectAnswers =
                    totalCorrectAnswers;

            this.quizPerformance =
                    quizPerformance;

            this.weakTopics =
                    weakTopics;

            this.strongTopics =
                    strongTopics;
        }

        public Long getStudentId() {
            return studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public double getAverageScore() {
            return averageScore;
        }

        public int getTotalQuizzes() {
            return totalQuizzes;
        }

        public int getTotalCorrectAnswers() {
            return totalCorrectAnswers;
        }

        public List<QuizPerformance> getQuizPerformance() {
            return quizPerformance;
        }

        public List<TopicPerformance> getWeakTopics() {
            return weakTopics;
        }

        public List<TopicPerformance> getStrongTopics() {
            return strongTopics;
        }
    }

    // =====================================================
    // QUIZ PERFORMANCE
    // =====================================================

    public static class QuizPerformance {

        private final Long quizId;

        private final String quizTitle;

        private final String subjectName;

        private final Long topicId;

        private final String topicName;

        private final Integer score;

        private final Integer correctAnswers;

        private final Integer totalQuestions;

        private final java.time.LocalDateTime submittedAt;

        public QuizPerformance(
                Long quizId,
                String quizTitle,
                String subjectName,
                Long topicId,
                String topicName,
                Integer score,
                Integer correctAnswers,
                Integer totalQuestions,
                java.time.LocalDateTime submittedAt) {

            this.quizId =
                    quizId;

            this.quizTitle =
                    quizTitle;

            this.subjectName =
                    subjectName;

            this.topicId =
                    topicId;

            this.topicName =
                    topicName;

            this.score =
                    score;

            this.correctAnswers =
                    correctAnswers;

            this.totalQuestions =
                    totalQuestions;

            this.submittedAt =
                    submittedAt;
        }

        public Long getQuizId() {
            return quizId;
        }

        public String getQuizTitle() {
            return quizTitle;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public Long getTopicId() {
            return topicId;
        }

        public String getTopicName() {
            return topicName;
        }

        public Integer getScore() {
            return score;
        }

        public Integer getCorrectAnswers() {
            return correctAnswers;
        }

        public Integer getTotalQuestions() {
            return totalQuestions;
        }

        public java.time.LocalDateTime getSubmittedAt() {
            return submittedAt;
        }
    }

    // =====================================================
    // TOPIC PERFORMANCE
    // =====================================================

    public static class TopicPerformance {

        private final Long topicId;

        private final String topicName;

        private final String subjectName;

        private final double averageScore;

        private final int attemptCount;

        private final int totalQuestions;

        private final int totalCorrectAnswers;

        public TopicPerformance(
                Long topicId,
                String topicName,
                String subjectName,
                double averageScore,
                int attemptCount,
                int totalQuestions,
                int totalCorrectAnswers) {

            this.topicId =
                    topicId;

            this.topicName =
                    topicName;

            this.subjectName =
                    subjectName;

            this.averageScore =
                    averageScore;

            this.attemptCount =
                    attemptCount;

            this.totalQuestions =
                    totalQuestions;

            this.totalCorrectAnswers =
                    totalCorrectAnswers;
        }

        public Long getTopicId() {
            return topicId;
        }

        public String getTopicName() {
            return topicName;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public double getAverageScore() {
            return averageScore;
        }

        public int getAttemptCount() {
            return attemptCount;
        }

        public int getTotalQuestions() {
            return totalQuestions;
        }

        public int getTotalCorrectAnswers() {
            return totalCorrectAnswers;
        }
    }

    // =====================================================
    // INTERNAL TOPIC ACCUMULATOR
    // =====================================================

    private static class TopicPerformanceAccumulator {

        private final Long topicId;

        private final String topicName;

        private final String subjectName;

        private double totalScore;

        private int attemptCount;

        private int totalQuestions;

        private int totalCorrectAnswers;

        private TopicPerformanceAccumulator(
                Long topicId,
                String topicName,
                String subjectName) {

            this.topicId =
                    topicId;

            this.topicName =
                    topicName;

            this.subjectName =
                    subjectName;
        }

        private void addAttempt(
                QuizAttempt attempt) {

            if (attempt.getScore() != null) {

                totalScore +=
                        attempt.getScore();
            }

            attemptCount++;

            if (attempt.getTotalQuestions() != null) {

                totalQuestions +=
                        attempt.getTotalQuestions();
            }

            if (attempt.getCorrectAnswers() != null) {

                totalCorrectAnswers +=
                        attempt.getCorrectAnswers();
            }
        }

        private TopicPerformance toTopicPerformance() {

            double averageScore =
                    attemptCount == 0
                            ? 0.0
                            : totalScore / attemptCount;

            return new TopicPerformance(
                    topicId,
                    topicName,
                    subjectName,
                    Math.round(
                            averageScore * 100.0
                    ) / 100.0,
                    attemptCount,
                    totalQuestions,
                    totalCorrectAnswers
            );
        }
    }
}