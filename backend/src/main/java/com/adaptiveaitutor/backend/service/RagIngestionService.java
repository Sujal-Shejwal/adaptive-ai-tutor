package com.adaptiveaitutor.backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Note;

@Service
public class RagIngestionService {

    private static final int EMBEDDING_BATCH_SIZE = 50;

    private final NoteService noteService;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final TextChunkingService textChunkingService;
    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    public RagIngestionService(
            NoteService noteService,
            PdfTextExtractorService pdfTextExtractorService,
            TextChunkingService textChunkingService,
            VectorStore vectorStore,
            JdbcTemplate jdbcTemplate) {

        this.noteService = noteService;
        this.pdfTextExtractorService = pdfTextExtractorService;
        this.textChunkingService = textChunkingService;
        this.vectorStore = vectorStore;
        this.jdbcTemplate = jdbcTemplate;
    }

    // =====================================================
    // INGEST ONE PDF INTO VECTOR STORE
    // =====================================================

    public Map<String, Object> ingestNote(Long noteId) {

        Note note = noteService
                .getNoteById(noteId)
                .orElse(null);

        if (note == null) {
            throw new RuntimeException("Note not found: " + noteId);
        }

        Path temporaryPdf = null;

        try {

            // 1. Get PDF file path

            String filePath = note.getFilePath();

            if (filePath == null || filePath.isBlank()) {
                throw new RuntimeException(
                        "PDF file path is empty for note: " + noteId);
            }

            // 2. Download PDF from Vercel Blob when necessary

            if (filePath.startsWith("https://")
                    || filePath.startsWith("http://")) {

                temporaryPdf = downloadBlobPdf(filePath);
                filePath = temporaryPdf.toString();
            }

            // 3. Extract PDF text

            String text = pdfTextExtractorService.extractText(filePath);

            // 4. Split text into chunks

            List<String> chunks = textChunkingService.chunkText(text);

            if (chunks.isEmpty()) {
                throw new RuntimeException(
                        "No text chunks created for note: " + noteId);
            }

            // 5. Convert chunks into Spring AI Documents

            List<Document> documents = new ArrayList<>();

            for (int i = 0; i < chunks.size(); i++) {

                Map<String, Object> metadata = new HashMap<>();

                metadata.put("noteId", note.getId());
                metadata.put("fileName", note.getFileName());
                metadata.put("topicId", note.getTopic().getId());
                metadata.put("chunkIndex", i);

                documents.add(new Document(chunks.get(i), metadata));
            }

            // 6. Log diagnostic information

            System.out.println("========== PDF INGESTION DEBUG ==========");
            System.out.println("Note ID: " + noteId);
            System.out.println("File name: " + note.getFileName());
            System.out.println("Extracted text length: "
                    + (text == null ? 0 : text.length()));
            System.out.println("Chunks created: " + chunks.size());
            System.out.println("Documents created: " + documents.size());
            System.out.println("Embedding batch size: " + EMBEDDING_BATCH_SIZE);
            System.out.println("==========================================");

            if (documents.isEmpty()) {
                throw new RuntimeException(
                        "No documents created for embedding. Note ID: " + noteId);
            }

            // 7. Store documents in smaller batches

            int totalDocuments = documents.size();

            for (int start = 0; start < totalDocuments;
                    start += EMBEDDING_BATCH_SIZE) {

                int end = Math.min(
                        start + EMBEDDING_BATCH_SIZE,
                        totalDocuments);

                List<Document> batch = documents.subList(start, end);

                System.out.println(
                        "Embedding batch: " + (start + 1) + "-" + end
                                + " of " + totalDocuments);

                vectorStore.add(batch);
            }

            System.out.println(
                    "Successfully ingested " + totalDocuments
                            + " documents for note " + noteId);

            // 8. Return result

            Map<String, Object> result = new HashMap<>();

            result.put("success", true);
            result.put("noteId", noteId);
            result.put("fileName", note.getFileName());
            result.put("totalChunks", totalDocuments);
            result.put("message", "PDF successfully ingested into PGVector");

            return result;

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Failed to ingest PDF: " + note.getFileName(),
                    exception);

        } finally {

            // 9. Delete temporary Blob PDF

            if (temporaryPdf != null) {
                try {
                    Files.deleteIfExists(temporaryPdf);
                } catch (IOException exception) {
                    System.err.println(
                            "Could not delete temporary PDF: " + temporaryPdf);
                }
            }
        }
    }

    // =====================================================
    // DOWNLOAD VERCEL BLOB PDF
    // =====================================================

    private Path downloadBlobPdf(String blobUrl) {

        try {

            HttpClient httpClient = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(blobUrl))
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Failed to download PDF from Vercel Blob. HTTP status: "
                                + response.statusCode());
            }

            Path temporaryFile = Files.createTempFile(
                    "adaptive-ai-tutor-",
                    ".pdf");

            Files.write(temporaryFile, response.body());

            return temporaryFile;

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Failed to download PDF from Vercel Blob",
                    exception);
        }
    }

    // =====================================================
    // DELETE VECTOR CHUNKS FOR NOTE
    // =====================================================

    public int deleteVectorsForNote(Long noteId) {

        if (noteId == null) {
            return 0;
        }

        String sql = """
                DELETE FROM public.vector_store
                WHERE metadata->>'noteId' = ?
                """;

        return jdbcTemplate.update(sql, noteId.toString());
    }


    // =====================================================
// RETRIEVE STORED TEXT CHUNKS FOR A NOTE
// =====================================================

public String getStoredTextForNote(Long noteId) {

    if (noteId == null) {
        return "";
    }

    String sql = """
            SELECT content
            FROM public.vector_store
            WHERE metadata->>'noteId' = ?
            ORDER BY (metadata->>'chunkIndex')::INTEGER
            """;

    List<String> chunks = jdbcTemplate.query(
            sql,
            (resultSet, rowNumber) ->
                    resultSet.getString("content"),
            noteId.toString()
    );

    return String.join("\n\n", chunks).trim();
}
}