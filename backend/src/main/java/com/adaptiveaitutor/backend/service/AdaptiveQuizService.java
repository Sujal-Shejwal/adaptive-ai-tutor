package com.adaptiveaitutor.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.Topic;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.QuizRepository;
import com.adaptiveaitutor.backend.repository.TopicRepository;

@Service
public class AdaptiveQuizService {

    private final AIQuizGeneratorService aiQuizGeneratorService;

    private final TopicRepository topicRepository;

    private final QuizRepository quizRepository;

    public AdaptiveQuizService(
            AIQuizGeneratorService aiQuizGeneratorService,
            TopicRepository topicRepository,
            QuizRepository quizRepository) {

        this.aiQuizGeneratorService =
                aiQuizGeneratorService;

        this.topicRepository =
                topicRepository;

        this.quizRepository =
                quizRepository;
    }

    // =====================================================
    // GENERATE ADAPTIVE PRACTICE QUIZ
    // =====================================================

    @Transactional
    public AIQuizGeneratorService.QuizGenerationResult
            generateAdaptiveQuiz(
                    Long studentId,
                    Long topicId,
                    Integer questionCount,
                    Integer duration,
                    Integer deadlineHours) {

        // -------------------------------------------------
        // VALIDATE STUDENT
        // -------------------------------------------------

        if (studentId == null) {

            throw new RuntimeException(
                    "Student ID is required."
            );
        }

        // -------------------------------------------------
        // VALIDATE TOPIC
        // -------------------------------------------------

        if (topicId == null) {

            throw new RuntimeException(
                    "Topic ID is required."
            );
        }

        // -------------------------------------------------
        // FIND TOPIC
        // -------------------------------------------------

        Topic topic =
                topicRepository
                        .findById(topicId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Topic not found."
                                        )
                        );

        // -------------------------------------------------
        // FIND SUBJECT
        // -------------------------------------------------

        if (
                topic.getUnit() == null ||
                topic.getUnit().getSubject() == null
        ) {

            throw new RuntimeException(
                    "Topic is not connected to a subject."
            );
        }

        Long subjectId =
                topic.getUnit()
                        .getSubject()
                        .getId();

        // -------------------------------------------------
        // FIND A TEACHER THROUGH EXISTING TOPIC QUIZZES
        // -------------------------------------------------

        List<Quiz> topicQuizzes =
                quizRepository
                        .findByTopicId(
                                topicId
                        );

        Quiz sourceQuiz = null;

        if (
                topicQuizzes != null &&
                !topicQuizzes.isEmpty()
        ) {

            sourceQuiz =
                    topicQuizzes.get(0);
        }

        // -------------------------------------------------
        // FALLBACK TO SUBJECT QUIZ
        // -------------------------------------------------

        if (sourceQuiz == null) {

            List<Quiz> subjectQuizzes =
                    quizRepository
                            .findBySubjectId(
                                    subjectId
                            );

            if (
                    subjectQuizzes != null &&
                    !subjectQuizzes.isEmpty()
            ) {

                sourceQuiz =
                        subjectQuizzes.get(0);
            }
        }

        // -------------------------------------------------
        // REQUIRE TEACHER SOURCE
        // -------------------------------------------------

        if (
                sourceQuiz == null ||
                sourceQuiz.getCreatedBy() == null
        ) {

            throw new RuntimeException(
                    "No teacher quiz exists for this topic yet. "
                            + "Ask the teacher to create a quiz for this topic first."
            );
        }

        User teacher =
                sourceQuiz.getCreatedBy();

        Long teacherId =
                teacher.getId();

        // -------------------------------------------------
        // DEFAULT VALUES
        // -------------------------------------------------

        int finalQuestionCount =
                questionCount == null
                        ? 5
                        : questionCount;

        int finalDuration =
                duration == null
                        ? 15
                        : duration;

        int finalDeadlineHours =
                deadlineHours == null
                        ? 12
                        : deadlineHours;

        // -------------------------------------------------
        // VALIDATE QUESTION COUNT
        // -------------------------------------------------

        if (
                finalQuestionCount < 1 ||
                finalQuestionCount > 20
        ) {

            throw new RuntimeException(
                    "Question count must be between 1 and 20."
            );
        }

        // -------------------------------------------------
        // VALIDATE DURATION
        // -------------------------------------------------

        if (
                finalDuration < 1
        ) {

            throw new RuntimeException(
                    "Duration must be at least 1 minute."
            );
        }

        // -------------------------------------------------
        // VALIDATE DEADLINE
        // -------------------------------------------------

        if (
                finalDeadlineHours != 12 &&
                finalDeadlineHours != 24 &&
                finalDeadlineHours != 48
        ) {

            throw new RuntimeException(
                    "Deadline must be 12, 24, or 48 hours."
            );
        }

        // -------------------------------------------------
        // GENERATE PERSONALIZED QUIZ
        // -------------------------------------------------

        return aiQuizGeneratorService.generateQuiz(
                topicId,
                finalQuestionCount,
                finalDuration,
                subjectId,
                teacherId,
                finalDeadlineHours,
                studentId
        );
    }
}