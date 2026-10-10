package com.adaptiveaitutor.backend.service;

import java.io.File;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
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
    private final RagIngestionService ragIngestionService;
    private final PerformanceAnalysisService performanceAnalysisService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int MAX_CONTEXT_CHARACTERS = 60000;

    public AIQuizGeneratorService(
            ChatClient.Builder chatClientBuilder,
            QuizService quizService,
            NoteRepository noteRepository,
            RagIngestionService ragIngestionService,
            PerformanceAnalysisService performanceAnalysisService) {

        this.chatClient = chatClientBuilder.build();
        this.quizService = quizService;
        this.noteRepository = noteRepository;
        this.ragIngestionService = ragIngestionService;
        this.performanceAnalysisService = performanceAnalysisService;
    }

    // Normal teacher-created AI quiz.
    // No student ID means MEDIUM difficulty.
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

    // Adaptive AI quiz generation.
    @Transactional
    public QuizGenerationResult generateQuiz(
            Long topicId,
            Integer questionCount,
            Integer duration,
            Long subjectId,
            Long teacherId,
            Integer deadlineHours,
            Long studentId) {

        if (topicId == null) {
            throw new RuntimeException("Topic ID is required.");
        }

        if (questionCount == null
                || questionCount < 1
                || questionCount > 20) {
            throw new RuntimeException(
                    "Question count must be between 1 and 20."
            );
        }

        if (duration == null || duration < 1) {
            throw new RuntimeException(
                    "Duration must be at least 1 minute."
            );
        }

        if (subjectId == null) {
            throw new RuntimeException("Subject ID is required.");
        }

        if (teacherId == null) {
            throw new RuntimeException("Teacher ID is required.");
        }

        if (deadlineHours == null
                || (deadlineHours != 12
                && deadlineHours != 24
                && deadlineHours != 48)) {
            throw new RuntimeException(
                    "Deadline must be 12, 24, or 48 hours."
            );
        }

        String difficulty = determineDifficulty(studentId, topicId);

        System.out.println("==========================================");
        System.out.println("AI QUIZ DIFFICULTY");
        System.out.println("Student ID: " + studentId);
        System.out.println("Topic ID: " + topicId);
        System.out.println("Selected difficulty: " + difficulty);
        System.out.println("==========================================");

        List<Note> notes;

        try {
            notes = noteRepository.findByTopicId(topicId);
        } catch (Exception exception) {
            exception.printStackTrace();
            throw new RuntimeException(
                    "Unable to load course material."
            );
        }

        if (notes == null || notes.isEmpty()) {
            throw new RuntimeException(
                    "No learning material found for topic ID: " + topicId
            );
        }

        // First, use the text already stored in the vector database.
        String courseMaterial =
                extractCourseMaterialFromStoredChunks(notes);

        if (courseMaterial == null || courseMaterial.isBlank()) {
            throw new RuntimeException(
                    "Unable to extract usable text from the "
                            + "learning material for this topic."
            );
        }

        String prompt = """
                You are an AI quiz generator for an educational application.

                Generate a multiple-choice quiz ONLY from the course
                material provided below.

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

                Generate questions appropriate for this difficulty level.

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
                The selected difficulty must affect the actual question
                complexity, not just the wording.

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
                """.formatted(
                courseMaterial,
                difficulty,
                questionCount,
                questionCount
        );

        String aiResponse;

        try {
            aiResponse = chatClient
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

        if (aiResponse == null || aiResponse.isBlank()) {
            throw new RuntimeException(
                    "AI returned an empty quiz response."
            );
        }

        String cleanJson = cleanJsonResponse(aiResponse);

        JsonNode root;

        try {
            root = objectMapper.readTree(cleanJson);
        } catch (Exception exception) {
            exception.printStackTrace();
            throw new RuntimeException(
                    "AI returned invalid quiz JSON."
            );
        }

        if (root == null || !root.isObject()) {
            throw new RuntimeException(
                    "AI quiz response has invalid structure."
            );
        }

        JsonNode titleNode = root.get("title");
        JsonNode questionsNode = root.get("questions");

        if (titleNode == null
                || !titleNode.isTextual()
                || titleNode.asText().isBlank()) {
            throw new RuntimeException(
                    "AI quiz title is missing."
            );
        }

        if (questionsNode == null || !questionsNode.isArray()) {
            throw new RuntimeException(
                    "AI quiz questions are missing."
            );
        }

        if (questionsNode.size() != questionCount) {
            throw new RuntimeException(
                    "AI generated "
                            + questionsNode.size()
                            + " questions instead of "
                            + questionCount
                            + "."
            );
        }

        List<GeneratedQuestion> generatedQuestions =
                new ArrayList<>();

        for (JsonNode questionNode : questionsNode) {
            generatedQuestions.add(parseQuestion(questionNode));
        }

        Quiz quiz = quizService.createQuiz(
                titleNode.asText().trim(),
                duration,
                subjectId,
                topicId,
                teacherId,
                deadlineHours
        );

        // Mark quizzes generated for a student as adaptive.
        if (studentId != null) {
            quiz.setAdaptive(true);
            quiz.setDifficulty(difficulty);

            if (quiz.getTopic() != null
                    && quiz.getTopic().getTitle() != null
                    && !quiz.getTopic().getTitle().isBlank()) {

                quiz.setTitle(
                        quiz.getTopic().getTitle().trim()
                                + " Adaptive Practice Quiz"
                );
            } else {
                quiz.setTitle("Adaptive Practice Quiz");
            }
        }

        List<QuizQuestion> savedQuestions = new ArrayList<>();

        for (GeneratedQuestion generatedQuestion : generatedQuestions) {
            QuizQuestion savedQuestion = quizService.addQuestion(
                    quiz.getId(),
                    generatedQuestion.question,
                    generatedQuestion.option1,
                    generatedQuestion.option2,
                    generatedQuestion.option3,
                    generatedQuestion.option4,
                    generatedQuestion.correctAnswer
            );

            savedQuestions.add(savedQuestion);
        }

        return new QuizGenerationResult(quiz, savedQuestions);
    }

    // Determine quiz difficulty using the student's performance.
    private String determineDifficulty(Long studentId, Long topicId) {

        if (studentId == null) {
            return "MEDIUM";
        }

        try {
            PerformanceAnalysisService.PerformanceAnalysis analysis =
                    performanceAnalysisService.analyzeStudentPerformance(
                            studentId
                    );

            // Check weak topics first.
            if (analysis.getWeakTopics() != null) {
                for (PerformanceAnalysisService.TopicPerformance topic
                        : analysis.getWeakTopics()) {

                    if (topic.getTopicId() != null
                            && topic.getTopicId().equals(topicId)) {

                        return difficultyFromScore(
                                topic.getAverageScore()
                        );
                    }
                }
            }

            // Check strong topics next.
            if (analysis.getStrongTopics() != null) {
                for (PerformanceAnalysisService.TopicPerformance topic
                        : analysis.getStrongTopics()) {

                    if (topic.getTopicId() != null
                            && topic.getTopicId().equals(topicId)) {

                        return difficultyFromScore(
                                topic.getAverageScore()
                        );
                    }
                }
            }

            // Calculate the average score for this topic.
            if (analysis.getQuizPerformance() != null
                    && !analysis.getQuizPerformance().isEmpty()) {

                double totalScore = 0.0;
                int count = 0;

                for (PerformanceAnalysisService.QuizPerformance quiz
                        : analysis.getQuizPerformance()) {

                    if (quiz.getTopicId() != null
                            && quiz.getTopicId().equals(topicId)
                            && quiz.getScore() != null) {

                        totalScore += quiz.getScore();
                        count++;
                    }
                }

                if (count > 0) {
                    double topicAverage = totalScore / count;
                    return difficultyFromScore(topicAverage);
                }
            }

            // Fall back to the overall average performance.
            return difficultyFromScore(analysis.getAverageScore());

        } catch (Exception exception) {
            exception.printStackTrace();
            return "MEDIUM";
        }
    }

    private String difficultyFromScore(double score) {
        if (score < 60) {
            return "EASY";
        } else if (score < 80) {
            return "MEDIUM";
        } else {
            return "HARD";
        }
    }

    // Read previously extracted learning material from PGVector.
    private String extractCourseMaterialFromStoredChunks(List<Note> notes) {

        StringBuilder material = new StringBuilder();

        if (notes == null || notes.isEmpty()) {
            return "";
        }

        for (Note note : notes) {

            if (note == null || note.getId() == null) {
                continue;
            }

            if (material.length() >= MAX_CONTEXT_CHARACTERS) {
                break;
            }

            try {
                String storedText =
                        ragIngestionService.getStoredTextForNote(
                                note.getId()
                        );

                if (storedText == null || storedText.isBlank()) {
                    continue;
                }

                // Correct regex: two backslashes before s.
                String cleanedText = storedText
                        .replaceAll("\\s+", " ")
                        .trim();

                int remaining =
                        MAX_CONTEXT_CHARACTERS - material.length();

                if (remaining <= 0) {
                    break;
                }

                if (cleanedText.length() > remaining) {
                    cleanedText = cleanedText.substring(0, remaining);
                }

                material.append("\n\n===== ")
                        .append(note.getFileName())
                        .append(" =====\n\n")
                        .append(cleanedText);

            } catch (Exception exception) {
                System.out.println(
                        "Unable to retrieve stored text for note: "
                                + note.getId()
                );

                exception.printStackTrace();
            }
        }

        if (!material.toString().isBlank()) {
            return material.toString().trim();
        }

        // Fall back to reading the PDF files directly.
        return extractCourseMaterial(notes);
    }

    // Extract course material from PDF files.
    private String extractCourseMaterial(List<Note> notes) {

        StringBuilder material = new StringBuilder();

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();

        for (Note note : notes) {

            if (note == null
                    || note.getFilePath() == null
                    || note.getFilePath().isBlank()) {
                continue;
            }

            if (material.length() >= MAX_CONTEXT_CHARACTERS) {
                break;
            }

            String filePath = note.getFilePath().trim();

            try (PDDocument document =
                         loadPdfDocument(httpClient, filePath)) {

                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);

                if (text == null || text.isBlank()) {
                    continue;
                }

                // Corrected here as well.
                String cleanedText = text
                        .replaceAll("\\s+", " ")
                        .trim();

                int remaining =
                        MAX_CONTEXT_CHARACTERS - material.length();

                if (remaining <= 0) {
                    break;
                }

                if (cleanedText.length() > remaining) {
                    cleanedText = cleanedText.substring(0, remaining);
                }

                material.append("\n\n===== ")
                        .append(note.getFileName())
                        .append(" =====\n\n")
                        .append(cleanedText);

            } catch (Exception exception) {
                System.out.println("Unable to extract PDF: " + filePath);
                exception.printStackTrace();
            }
        }

        return material.toString().trim();
    }

    // Supports both public HTTP(S) PDF URLs and local PDF files.
    private PDDocument loadPdfDocument(
            HttpClient httpClient,
            String filePath) throws Exception {

        if (filePath.startsWith("https://")
                || filePath.startsWith("http://")) {

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(filePath))
                    .timeout(Duration.ofSeconds(60))
                    .GET()
                    .build();

            HttpResponse<InputStream> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofInputStream()
            );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                try (InputStream body = response.body()) {
                    body.transferTo(
                            java.io.OutputStream.nullOutputStream()
                    );
                }

                throw new RuntimeException(
                        "Failed to download PDF. HTTP status: "
                                + response.statusCode()
                );
            }

            try (InputStream inputStream = response.body()) {
                byte[] pdfBytes = inputStream.readAllBytes();
                return Loader.loadPDF(pdfBytes);
            }
        }

        File pdfFile = new File(filePath);

        if (!pdfFile.exists() || !pdfFile.isFile()) {
            throw new java.io.FileNotFoundException(
                    "PDF file not found: " + filePath
            );
        }

        return Loader.loadPDF(pdfFile);
    }

    private GeneratedQuestion parseQuestion(JsonNode questionNode) {

        if (questionNode == null || !questionNode.isObject()) {
            throw new RuntimeException(
                    "Invalid AI question structure."
            );
        }

        String question = getRequiredText(questionNode, "question");
        String option1 = getRequiredText(questionNode, "option1");
        String option2 = getRequiredText(questionNode, "option2");
        String option3 = getRequiredText(questionNode, "option3");
        String option4 = getRequiredText(questionNode, "option4");
        String explanation = getRequiredText(questionNode, "explanation");

        JsonNode correctAnswerNode = questionNode.get("correctAnswer");

        if (correctAnswerNode == null
                || !correctAnswerNode.canConvertToInt()) {
            throw new RuntimeException(
                    "Invalid correctAnswer in AI quiz."
            );
        }

        int correctAnswer = correctAnswerNode.asInt();

        if (correctAnswer < 0 || correctAnswer > 3) {
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

    private String getRequiredText(
            JsonNode node,
            String fieldName) {

        JsonNode field = node.get(fieldName);

        if (field == null
                || !field.isTextual()
                || field.asText().isBlank()) {
            throw new RuntimeException(
                    "AI quiz field is missing: " + fieldName
            );
        }

        return field.asText().trim();
    }

    private String cleanJsonResponse(String response) {

        String cleaned = response.trim();

        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7).trim();
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3).trim();
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(
                    0,
                    cleaned.length() - 3
            ).trim();
        }

        return cleaned;
    }

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

            this.question = question;
            this.option1 = option1;
            this.option2 = option2;
            this.option3 = option3;
            this.option4 = option4;
            this.correctAnswer = correctAnswer;
            this.explanation = explanation;
        }
    }

    public static class QuizGenerationResult {

        private final Quiz quiz;
        private final List<QuizQuestion> questions;

        public QuizGenerationResult(
                Quiz quiz,
                List<QuizQuestion> questions) {

            this.quiz = quiz;
            this.questions = questions;
        }

        public Quiz getQuiz() {
            return quiz;
        }

        public List<QuizQuestion> getQuestions() {
            return questions;
        }
    }
}