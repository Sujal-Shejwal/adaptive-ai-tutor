
package com.adaptiveaitutor.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class TextChunkingService {

    private static final int CHUNK_SIZE = 1000;
    private static final int OVERLAP_SIZE = 200;

    public List<String> chunkText(String text) {

        if (text == null || text.isBlank()) {
            return List.of();
        }

        String normalizedText = text.trim();
        List<String> chunks = new ArrayList<>();

        int start = 0;
        int textLength = normalizedText.length();

        while (start < textLength) {

            int end = Math.min(start + CHUNK_SIZE, textLength);

            if (end < textLength) {
                int lastSpace = normalizedText.lastIndexOf(' ', end);

                if (lastSpace > start) {
                    end = lastSpace;
                }
            }

            String chunk = normalizedText.substring(start, end).trim();

            if (!chunk.isEmpty()) {
                chunks.add(chunk);
            }

            if (end >= textLength) {
                break;
            }

            int nextStart = end - OVERLAP_SIZE;

            if (nextStart <= start) {
                nextStart = end;
            }

            start = nextStart;
        }

        System.out.println("Text length: " + textLength);
        System.out.println("Chunks generated: " + chunks.size());

        return chunks;
    }
}
