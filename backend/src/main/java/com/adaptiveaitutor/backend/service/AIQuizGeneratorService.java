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

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    // Maximum amount of extracted material sent to Gemini.
    private static final int MAX_CONTEXT_CHARACTERS =
            60000;

    public AIQuizGeneratorService(
            ChatClient.Builder chatClientBuilder,
            QuizService quizService,
            NoteRepository noteRepository) {

        this.chatClient =
                chatClientBuilder.build();

        this.quizService =
                quizService;

        this.noteRepository =
                noteRepository;
    }

    // =====================================================
    // GENERATE AI QUIZ
    // =====================================================

    @Transactional
    public QuizGenerationResult generateQuiz(
            Long topicId,
            Integer questionCount,
            Integer duration,
            Long subjectId,
            Long teacherId,
            Integer deadlineHours) {

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
                REQUIREMENTS
                ============================================

                Generate exactly %d questions.

                Every question must:

                1. Be based only on the provided material.
                2. Be relevant to the selected topic.
                3. Have exactly four options.
                4. Have exactly one correct answer.
                5. Have a clear explanation.
                6. Avoid duplicate questions.
                7. Avoid ambiguous questions.
                8. Never invent information.

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
        // CREATE QUIZ
        // -------------------------------------------------

        Quiz quiz =
                quizService.createQuiz(
                        titleNode
                                .asText()
                                .trim(),
                        duration,
                        subjectId,
                        teacherId,
                        deadlineHours
                );

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
                    new File(filePath);

            if (!pdfFile.exists()) {

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
        }

        else if (
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