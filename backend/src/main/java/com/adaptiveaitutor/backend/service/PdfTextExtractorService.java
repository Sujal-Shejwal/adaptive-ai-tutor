package com.adaptiveaitutor.backend.service;

import java.io.IOException;
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

    public String extractText(
            String filePath) {

        if (
                filePath == null ||
                filePath.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "PDF file path cannot be empty"
            );
        }

        Path path =
                Path.of(filePath);

        if (!path.toFile().exists()) {

            throw new RuntimeException(
                    "PDF file not found: " + filePath
            );
        }

        try (
                PDDocument document =
                        Loader.loadPDF(
                                path.toFile()
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
                throw new RuntimeException(
                        "No text could be extracted from PDF"
                );
            }

            return text.trim();

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to extract PDF text",
                    exception
            );
        }
    }
}