package com.adaptiveaitutor.backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

@Service
public class PdfTextExtractorService {

    // =====================================================
    // EXTRACT TEXT FROM PDF
    // =====================================================

    public String extractText(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException(
                    "PDF file path cannot be empty"
            );
        }

        try {

            // =================================================
            // VERCEL BLOB / HTTP URL
            // =================================================

            if (
                    filePath.startsWith("http://") ||
                    filePath.startsWith("https://")
            ) {

                URL url = URI.create(filePath).toURL();

                byte[] pdfBytes;

                try (var inputStream = url.openStream()) {
                    pdfBytes = inputStream.readAllBytes();
                }

                try (
                        PDDocument document =
                                Loader.loadPDF(pdfBytes)
                ) {

                    PDFTextStripper stripper =
                            new PDFTextStripper();

                    String text =
                            stripper.getText(document);

                    if (text == null || text.isBlank()) {
                        throw new RuntimeException(
                                "No text could be extracted from PDF"
                        );
                    }

                    return text.trim();
                }
            }

            // =================================================
            // LOCAL FILE PATH
            // =================================================

            Path path = Path.of(filePath);

            if (!Files.exists(path)) {
                throw new RuntimeException(
                        "PDF file not found: " + filePath
                );
            }

            try (
                    PDDocument document =
                            Loader.loadPDF(path.toFile())
            ) {

                PDFTextStripper stripper =
                        new PDFTextStripper();

                String text =
                        stripper.getText(document);

                if (text == null || text.isBlank()) {
                    throw new RuntimeException(
                            "No text could be extracted from PDF"
                    );
                }

                return text.trim();
            }

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to extract PDF text",
                    exception
            );
        }
    }
}