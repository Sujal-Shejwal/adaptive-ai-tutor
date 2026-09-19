package com.adaptiveaitutor.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class TextChunkingService {

    // =====================================================
    // CHUNK SETTINGS
    // =====================================================

    private static final int CHUNK_SIZE = 1000;

    private static final int OVERLAP_SIZE = 200;


    // =====================================================
    // SPLIT TEXT INTO CHUNKS
    // =====================================================

    public List<String> chunkText(
            String text) {

        if (
                text == null ||
                text.isBlank()
        ) {
            return List.of();
        }


        String normalizedText =
                text.trim();


        List<String> chunks =
                new ArrayList<>();


        int start = 0;

        int textLength =
                normalizedText.length();


        while (
                start < textLength
        ) {

            int end =
                    Math.min(
                            start + CHUNK_SIZE,
                            textLength
                    );


            // ---------------------------------------------
            // Prefer breaking at whitespace
            // ---------------------------------------------

            if (
                    end < textLength
            ) {

                int lastSpace =
                        normalizedText
                                .lastIndexOf(
                                        ' ',
                                        end
                                );

                if (
                        lastSpace > start
                ) {

                    end =
                            lastSpace;
                }
            }


            String chunk =
                    normalizedText
                            .substring(
                                    start,
                                    end
                            )
                            .trim();


            if (!chunk.isEmpty()) {

                chunks.add(chunk);

            }


            // ---------------------------------------------
            // Move forward with overlap
            // ---------------------------------------------

            if (
                    end >= textLength
            ) {
                break;
            }


            start =
                    Math.max(
                            end - OVERLAP_SIZE,
                            start + 1
                    );
        }


        return chunks;
    }
}