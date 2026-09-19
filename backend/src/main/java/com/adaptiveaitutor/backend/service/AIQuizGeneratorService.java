package com.adaptiveaitutor.backend.service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.Note;
import com.adaptiveaitutor.backend.entity.Quiz;
import com.adaptiveaitutor.backend.entity.QuizQuestion;
import com.adaptiveaitutor.backend.repository.NoteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIQuizGeneratorService {

    private final ChatClient chatClient;

    private final QuizService quizService;

    private final NoteRepository noteRepository;

    private final PerformanceAnalysisService
            performanceAnalysisService;

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    // Maximum amount of extracted material sent to Gemini.
    private static final int MAX_CONTEXT_CHARACTERS =
            60000;

    public AIQuizGeneratorService(
            ChatClient.Builder chatClientBuilder,
            QuizService quizService,
            NoteRepository noteRepository,
            PerformanceAnalysisService performanceAnalysisService) {

        this.chatClient =
                chatClientBuilder.build();

        this.quizService =
                quizService;

        this.noteRepository =
                noteRepository;

        this.performanceAnalysisService =
                performanceAnalysisService;
    }

    // =====================================================
    // EXISTING GENERATE QUIZ METHOD
    // =====================================================
    // Normal teacher-created AI quiz.
    //
    // studentId = null
    // -> MEDIUM difficulty
    // -> normal quiz
    // =====================================================

    @Transactional
    public QuizGenerationResult generateQuiz(
            Long topicId,
            Integer questionCount,
            Integer duration,
            Long subjectId,
            Long teacherId,
            Integer deadlineHours) {

        return generateQuiz(
                topicId,
                questionCount,
                duration,
                subjectId,
                teacherId,
                deadlineHours,
                null
        );
    }

    // =====================================================
    // ADAPTIVE GENERATE QUIZ METHOD
    // =====================================================

    @Transactional
    public QuizGenerationResult generateQuiz(
            Long topicId,
            Integer questionCount,
            Integer duration,
            Long subjectId,
            Long teacherId,
            Integer deadlineHours,
            Long studentId) {

        // -------------------------------------------------
        // VALIDATE TOPIC
        // -------------------------------------------------

        if (topicId == null) {

            throw new RuntimeException(
                    "Topic ID is required."
            );
        }

        // -------------------------------------------------
        // VALIDATE QUESTION COUNT
        // -------------------------------------------------

        if (
                questionCount == null ||
                questionCount < 1 ||
                questionCount > 20
        ) {

            throw new RuntimeException(
                    "Question count must be between 1 and 20."
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
                    "Duration must be at least 1 minute."
            );
        }

        // -------------------------------------------------
        // VALIDATE SUBJECT
        // -------------------------------------------------

        if (subjectId == null) {

            throw new RuntimeException(
                    "Subject ID is required."
            );
        }

        // -------------------------------------------------
        // VALIDATE TEACHER
        // -------------------------------------------------

        if (teacherId == null) {

            throw new RuntimeException(
                    "Teacher ID is required."
            );
        }

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
                    "Deadline must be 12, 24, or 48 hours."
            );
        }

        // -------------------------------------------------
        // DETERMINE DIFFICULTY
        // -------------------------------------------------

        String difficulty =
                determineDifficulty(
                        studentId,
                        topicId
                );

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "AI QUIZ DIFFICULTY"
        );

        System.out.println(
                "Student ID: "
                        + studentId
        );

        System.out.println(
                "Topic ID: "
                        + topicId
        );

        System.out.println(
                "Selected difficulty: "
                        + difficulty
        );

        System.out.println(
                "=========================================="
        );

        // -------------------------------------------------
        // GET NOTES FOR EXACT TOPIC
        // -------------------------------------------------

        List<Note> notes;

        try {

            notes =
                    noteRepository
                            .findByTopicId(
                                    topicId
                            );

        } catch (Exception exception) {

            exception.printStackTrace();

            throw new RuntimeException(
                    "Unable to load course material."
            );
        }

        if (
                notes == null ||
                notes.isEmpty()
        ) {

            throw new RuntimeException(
                    "No learning material found for topic ID: "
                            + topicId
            );
        }

        // -------------------------------------------------
        // EXTRACT PDF TEXT
        // -------------------------------------------------

        String courseMaterial =
                extractCourseMaterial(
                        notes
                );

        if (
                courseMaterial == null ||
                courseMaterial.isBlank()
        ) {

            throw new RuntimeException(
                    "Unable to extract usable text from the "
                            + "learning material for this topic."
            );
        }

        // -------------------------------------------------
        // BUILD PROMPT
        // -------------------------------------------------

        String prompt =
                """
                You are an AI quiz generator for an
                educational application.

                Generate a multiple-choice quiz ONLY from
                the course material provided below.

                The material belongs to ONE selected topic.

                Do not use outside knowledge.

                ============================================
                COURSE MATERIAL
                ============================================

                %s

                ============================================
                ADAPTIVE DIFFICULTY
                ============================================

                Target difficulty: %s

                Generate questions appropriate for this
                difficulty level.

                EASY:
                - Focus on fundamental concepts.
                - Test basic understanding and recognition.
                - Use clear and direct wording.
                - Prefer simple examples.
                - Avoid unnecessary complexity.

                MEDIUM:
                - Test understanding and application.
                - Include moderate reasoning.
                - Use practical examples.
                - Require the student to apply concepts.

                HARD:
                - Test deeper understanding.
                - Require multi-step reasoning.
                - Use challenging applications and scenarios.
                - Distinguish strong understanding from memorization.

                IMPORTANT:
                The selected difficulty must affect the actual
                question complexity, not just the wording.

                ============================================
                REQUIREMENTS
                ============================================

                Generate exactly %d questions.

                Every question must:

                1. Be based only on the provided material.
                2. Be relevant to the selected topic.
                3. Match the requested difficulty.
                4. Have exactly four options.
                5. Have exactly one correct answer.
                6. Have a clear explanation.
                7. Avoid duplicate questions.
                8. Avoid ambiguous questions.
                9. Never invent information.

                Correct answer mapping:

                0 = option1
                1 = option2
                2 = option3
                3 = option4

                ============================================
                OUTPUT
                ============================================

                Return ONLY valid JSON.

                Do not return markdown.

                Do not use ```json.

                Do not write anything outside the JSON.

                Use exactly this structure:

                {
                  "title": "Topic Quiz",
                  "questions": [
                    {
                      "question": "Question text",
                      "option1": "Option A",
                      "option2": "Option B",
                      "option3": "Option C",
                      "option4": "Option D",
                      "correctAnswer": 0,
                      "explanation": "Why this answer is correct."
                    }
                  ]
                }

                Generate exactly %d questions.
                """
                .formatted(
                        courseMaterial,
                        difficulty,
                        questionCount,
                        questionCount
                );

        // -------------------------------------------------
        // CALL GEMINI
        // -------------------------------------------------

        String aiResponse;

        try {

            aiResponse =
                    chatClient
                            .prompt()
                            .user(prompt)
                            .call()
                            .content();

        } catch (Exception exception) {

            exception.printStackTrace();

            throw new RuntimeException(
                    "Unable to generate quiz using AI."
            );
        }

        // -------------------------------------------------
        // VALIDATE AI RESPONSE
        // -------------------------------------------------

        if (
                aiResponse == null ||
                aiResponse.isBlank()
        ) {

            throw new RuntimeException(
                    "AI returned an empty quiz response."
            );
        }

        // -------------------------------------------------
        // CLEAN JSON
        // -------------------------------------------------

        String cleanJson =
                cleanJsonResponse(
                        aiResponse
                );

        // -------------------------------------------------
        // PARSE JSON
        // -------------------------------------------------

        JsonNode root;

        try {

            root =
                    objectMapper.readTree(
                            cleanJson
                    );

        } catch (Exception exception) {

            exception.printStackTrace();

            throw new RuntimeException(
                    "AI returned invalid quiz JSON."
            );
        }

        // -------------------------------------------------
        // VALIDATE ROOT
        // -------------------------------------------------

        if (
                root == null ||
                !root.isObject()
        ) {

            throw new RuntimeException(
                    "AI quiz response has invalid structure."
            );
        }

        JsonNode titleNode =
                root.get("title");

        JsonNode questionsNode =
                root.get("questions");

        if (
                titleNode == null ||
                !titleNode.isTextual() ||
                titleNode.asText().isBlank()
        ) {

            throw new RuntimeException(
                    "AI quiz title is missing."
            );
        }

        if (
                questionsNode == null ||
                !questionsNode.isArray()
        ) {

            throw new RuntimeException(
                    "AI quiz questions are missing."
            );
        }

        // -------------------------------------------------
        // QUESTION COUNT CHECK
        // -------------------------------------------------

        if (
                questionsNode.size()
                        != questionCount
        ) {

            throw new RuntimeException(
                    "AI generated "
                            + questionsNode.size()
                            + " questions instead of "
                            + questionCount
                            + "."
            );
        }

        // -------------------------------------------------
        // PARSE QUESTIONS
        // -------------------------------------------------

        List<GeneratedQuestion> generatedQuestions =
                new ArrayList<>();

        for (
                JsonNode questionNode :
                questionsNode
        ) {

            generatedQuestions.add(
                    parseQuestion(
                            questionNode
                    )
            );
        }

        // -------------------------------------------------
        // CREATE TOPIC-BASED QUIZ
        // -------------------------------------------------

        Quiz quiz =
                quizService.createQuiz(
                        titleNode
                                .asText()
                                .trim(),
                        duration,
                        subjectId,
                        topicId,
                        teacherId,
                        deadlineHours
                );

        // =================================================
        // MARK ADAPTIVE QUIZ
        // =================================================
        //
        // This is the important Step 29 addition.
        //
        // Normal teacher AI quiz:
        // studentId == null
        // -> adaptive = false
        // -> difficulty = null
        //
        // Student adaptive quiz:
        // studentId != null
        // -> adaptive = true
        // -> difficulty = EASY/MEDIUM/HARD
        // =================================================

        if (studentId != null) {

            quiz.setAdaptive(
                    true
            );

            quiz.setDifficulty(
                    difficulty
            );

            // Keep adaptive quiz titles tied to the selected topic.
            // Gemini's title can otherwise reference an unrelated
            // concept even when the topic ID is correct.
            if (
                    quiz.getTopic() != null &&
                    quiz.getTopic().getTitle() != null &&
                    !quiz.getTopic().getTitle().isBlank()
            ) {
                quiz.setTitle(
                        quiz.getTopic().getTitle().trim()
                                + " Adaptive Practice Quiz"
                );
            } else {
                quiz.setTitle(
                        "Adaptive Practice Quiz"
                );
            }
        }

        // -------------------------------------------------
        // SAVE QUESTIONS
        // -------------------------------------------------

        List<QuizQuestion> savedQuestions =
                new ArrayList<>();

        for (
                GeneratedQuestion generatedQuestion :
                generatedQuestions
        ) {

            QuizQuestion savedQuestion =
                    quizService.addQuestion(
                            quiz.getId(),
                            generatedQuestion.question,
                            generatedQuestion.option1,
                            generatedQuestion.option2,
                            generatedQuestion.option3,
                            generatedQuestion.option4,
                            generatedQuestion.correctAnswer
                    );

            savedQuestions.add(
                    savedQuestion
            );
        }

        // -------------------------------------------------
        // RETURN RESULT
        // -------------------------------------------------

        return new QuizGenerationResult(
                quiz,
                savedQuestions
        );
    }

    // =====================================================
    // DETERMINE DIFFICULTY
    // =====================================================

    private String determineDifficulty(
            Long studentId,
            Long topicId) {

        // -------------------------------------------------
        // NO STUDENT = NORMAL TEACHER QUIZ
        // -------------------------------------------------

        if (studentId == null) {

            return "MEDIUM";
        }

        try {

            PerformanceAnalysisService
                    .PerformanceAnalysis analysis =
                    performanceAnalysisService
                            .analyzeStudentPerformance(
                                    studentId
                            );

            // -------------------------------------------------
            // FIRST: CHECK WEAK TOPICS
            // -------------------------------------------------

            if (
                    analysis.getWeakTopics() != null
            ) {

                for (
                        PerformanceAnalysisService.TopicPerformance topic :
                        analysis.getWeakTopics()
                ) {

                    if (
                            topic.getTopicId() != null &&
                            topic.getTopicId()
                                    .equals(
                                            topicId
                                    )
                    ) {

                        return difficultyFromScore(
                                topic.getAverageScore()
                        );
                    }
                }
            }

            // -------------------------------------------------
            // SECOND: CHECK STRONG TOPICS
            // -------------------------------------------------

            if (
                    analysis.getStrongTopics() != null
            ) {

                for (
                        PerformanceAnalysisService.TopicPerformance topic :
                        analysis.getStrongTopics()
                ) {

                    if (
                            topic.getTopicId() != null &&
                            topic.getTopicId()
                                    .equals(
                                            topicId
                                    )
                    ) {

                        return difficultyFromScore(
                                topic.getAverageScore()
                        );
                    }
                }
            }

            // -------------------------------------------------
            // THIRD: CALCULATE TOPIC AVERAGE DIRECTLY
            // -------------------------------------------------

            if (
                    analysis.getQuizPerformance() != null &&
                    !analysis.getQuizPerformance().isEmpty()
            ) {

                double totalScore =
                        0.0;

                int count =
                        0;

                for (
                        PerformanceAnalysisService.QuizPerformance quiz :
                        analysis.getQuizPerformance()
                ) {

                    if (
                            quiz.getTopicId() != null &&
                            quiz.getTopicId()
                                    .equals(
                                            topicId
                                    ) &&
                            quiz.getScore() != null
                    ) {

                        totalScore +=
                                quiz.getScore();

                        count++;
                    }
                }

                if (
                        count > 0
                ) {

                    double topicAverage =
                            totalScore
                                    / count;

                    return difficultyFromScore(
                            topicAverage
                    );
                }
            }

            // -------------------------------------------------
            // FINAL FALLBACK:
            // OVERALL PERFORMANCE
            // -------------------------------------------------

            return difficultyFromScore(
                    analysis.getAverageScore()
            );

        } catch (Exception exception) {

            // If adaptive analysis fails,
            // don't break quiz generation.

            exception.printStackTrace();

            return "MEDIUM";
        }
    }

    // =====================================================
    // SCORE → DIFFICULTY
    // =====================================================

    private String difficultyFromScore(
            double score) {

        if (
                score < 60
        ) {

            return "EASY";

        } else if (
                score < 80
        ) {

            return "MEDIUM";

        } else {

            return "HARD";
        }
    }

    // =====================================================
    // EXTRACT COURSE MATERIAL
    // =====================================================

    private String extractCourseMaterial(
            List<Note> notes) {

        StringBuilder material =
                new StringBuilder();

        for (
                Note note :
                notes
        ) {

            if (
                    note == null ||
                    note.getFilePath() == null ||
                    note.getFilePath().isBlank()
            ) {

                continue;
            }

            if (
                    material.length()
                            >= MAX_CONTEXT_CHARACTERS
            ) {

                break;
            }

            String filePath =
                    note.getFilePath()
                            .trim();

            File pdfFile =
                    new File(
                            filePath
                    );

            if (
                    !pdfFile.exists()
            ) {

                System.out.println(
                        "PDF file not found: "
                                + filePath
                );

                continue;
            }

            try (
                    PDDocument document =
                            Loader.loadPDF(
                                    pdfFile
                            )
            ) {

                PDFTextStripper stripper =
                        new PDFTextStripper();

                String text =
                        stripper.getText(
                                document
                        );

                if (
                        text == null ||
                        text.isBlank()
                ) {

                    continue;
                }

                String cleanedText =
                        text
                                .replaceAll(
                                        "\\s+",
                                        " "
                                )
                                .trim();

                int remaining =
                        MAX_CONTEXT_CHARACTERS
                                - material.length();

                if (
                        cleanedText.length()
                                > remaining
                ) {

                    cleanedText =
                            cleanedText.substring(
                                    0,
                                    remaining
                            );
                }

                material
                        .append(
                                "\n\n===== "
                        )
                        .append(
                                note.getFileName()
                        )
                        .append(
                                " =====\n\n"
                        )
                        .append(
                                cleanedText
                        );

            } catch (Exception exception) {

                System.out.println(
                        "Unable to extract PDF: "
                                + filePath
                );

                exception.printStackTrace();
            }
        }

        return material
                .toString()
                .trim();
    }

    // =====================================================
    // PARSE QUESTION
    // =====================================================

    private GeneratedQuestion parseQuestion(
            JsonNode questionNode) {

        if (
                questionNode == null ||
                !questionNode.isObject()
        ) {

            throw new RuntimeException(
                    "Invalid AI question structure."
            );
        }

        String question =
                getRequiredText(
                        questionNode,
                        "question"
                );

        String option1 =
                getRequiredText(
                        questionNode,
                        "option1"
                );

        String option2 =
                getRequiredText(
                        questionNode,
                        "option2"
                );

        String option3 =
                getRequiredText(
                        questionNode,
                        "option3"
                );

        String option4 =
                getRequiredText(
                        questionNode,
                        "option4"
                );

        String explanation =
                getRequiredText(
                        questionNode,
                        "explanation"
                );

        JsonNode correctAnswerNode =
                questionNode.get(
                        "correctAnswer"
                );

        if (
                correctAnswerNode == null ||
                !correctAnswerNode.canConvertToInt()
        ) {

            throw new RuntimeException(
                    "Invalid correctAnswer in AI quiz."
            );
        }

        int correctAnswer =
                correctAnswerNode.asInt();

        if (
                correctAnswer < 0 ||
                correctAnswer > 3
        ) {

            throw new RuntimeException(
                    "Correct answer must be between 0 and 3."
            );
        }

        return new GeneratedQuestion(
                question,
                option1,
                option2,
                option3,
                option4,
                correctAnswer,
                explanation
        );
    }

    // =====================================================
    // REQUIRED TEXT
    // =====================================================

    private String getRequiredText(
            JsonNode node,
            String fieldName) {

        JsonNode field =
                node.get(
                        fieldName
                );

        if (
                field == null ||
                !field.isTextual() ||
                field.asText().isBlank()
        ) {

            throw new RuntimeException(
                    "AI quiz field is missing: "
                            + fieldName
            );
        }

        return field
                .asText()
                .trim();
    }

    // =====================================================
    // CLEAN JSON RESPONSE
    // =====================================================

    private String cleanJsonResponse(
            String response) {

        String cleaned =
                response.trim();

        if (
                cleaned.startsWith(
                        "```json"
                )
        ) {

            cleaned =
                    cleaned
                            .substring(
                                    7
                            )
                            .trim();

        } else if (
                cleaned.startsWith(
                        "```"
                )
        ) {

            cleaned =
                    cleaned
                            .substring(
                                    3
                            )
                            .trim();
        }

        if (
                cleaned.endsWith(
                        "```"
                )
        ) {

            cleaned =
                    cleaned.substring(
                            0,
                            cleaned.length() - 3
                    ).trim();
        }

        return cleaned;
    }

    // =====================================================
    // GENERATED QUESTION
    // =====================================================

    private static class GeneratedQuestion {

        private final String question;

        private final String option1;

        private final String option2;

        private final String option3;

        private final String option4;

        private final int correctAnswer;

        @SuppressWarnings("unused")
        private final String explanation;

        private GeneratedQuestion(
                String question,
                String option1,
                String option2,
                String option3,
                String option4,
                int correctAnswer,
                String explanation) {

            this.question =
                    question;

            this.option1 =
                    option1;

            this.option2 =
                    option2;

            this.option3 =
                    option3;

            this.option4 =
                    option4;

            this.correctAnswer =
                    correctAnswer;

            this.explanation =
                    explanation;
        }
    }

    // =====================================================
    // RESULT
    // =====================================================

    public static class QuizGenerationResult {

        private final Quiz quiz;

        private final List<QuizQuestion> questions;

        public QuizGenerationResult(
                Quiz quiz,
                List<QuizQuestion> questions) {

            this.quiz =
                    quiz;

            this.questions =
                    questions;
        }

        public Quiz getQuiz() {
            return quiz;
        }

        public List<QuizQuestion> getQuestions() {
            return questions;
        }
    }
}