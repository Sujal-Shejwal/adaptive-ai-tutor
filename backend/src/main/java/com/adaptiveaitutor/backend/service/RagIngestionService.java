package com.adaptiveaitutor.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Note;

@Service
public class RagIngestionService {

    private final NoteService noteService;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final TextChunkingService textChunkingService;
    private final VectorStore vectorStore;

    public RagIngestionService(
            NoteService noteService,
            PdfTextExtractorService pdfTextExtractorService,
            TextChunkingService textChunkingService,
            VectorStore vectorStore) {

        this.noteService =
                noteService;

        this.pdfTextExtractorService =
                pdfTextExtractorService;

        this.textChunkingService =
                textChunkingService;

        this.vectorStore =
                vectorStore;
    }

    // =====================================================
    // INGEST ONE PDF INTO VECTOR STORE
    // =====================================================

    public Map<String, Object> ingestNote(
            Long noteId) {

        Note note =
                noteService
                        .getNoteById(noteId)
                        .orElse(null);

        if (note == null) {

            throw new RuntimeException(
                    "Note not found: " + noteId
            );
        }

        // -------------------------------------------------
        // 1. Extract PDF text
        // -------------------------------------------------

        String text =
                pdfTextExtractorService
                        .extractText(
                                note.getFilePath()
                        );

        // -------------------------------------------------
        // 2. Split text into chunks
        // -------------------------------------------------

        List<String> chunks =
                textChunkingService
                        .chunkText(text);

        if (chunks.isEmpty()) {

            throw new RuntimeException(
                    "No text chunks created for note: " +
                    noteId
            );
        }

        // -------------------------------------------------
        // 3. Convert chunks into Spring AI Documents
        // -------------------------------------------------

        List<Document> documents =
                new ArrayList<>();

        for (
                int i = 0;
                i < chunks.size();
                i++
        ) {

            Map<String, Object> metadata =
                    new HashMap<>();

            metadata.put(
                    "noteId",
                    note.getId()
            );

            metadata.put(
                    "fileName",
                    note.getFileName()
            );

            metadata.put(
                    "topicId",
                    note.getTopic().getId()
            );

            metadata.put(
                    "chunkIndex",
                    i
            );

            Document document =
                    new Document(
                            chunks.get(i),
                            metadata
                    );

            documents.add(document);
        }

        // -------------------------------------------------
        // 4. Store in PGVector
        // -------------------------------------------------

        vectorStore.add(
                documents
        );

        // -------------------------------------------------
        // 5. Return result
        // -------------------------------------------------

        Map<String, Object> result =
                new HashMap<>();

        result.put(
                "success",
                true
        );

        result.put(
                "noteId",
                noteId
        );

        result.put(
                "fileName",
                note.getFileName()
        );

        result.put(
                "totalChunks",
                documents.size()
        );

        result.put(
                "message",
                "PDF successfully ingested into PGVector"
        );

        return result;
    }
}