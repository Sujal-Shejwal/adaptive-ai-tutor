package com.adaptiveaitutor.backend.controller;

import com.adaptiveaitutor.backend.dto.BulkInvitationStudent;
import com.adaptiveaitutor.backend.dto.BulkInvitationUploadResponse;
import com.adaptiveaitutor.backend.service.BulkStudentFileParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classroom-invitations")
@CrossOrigin(origins = "http://localhost:5173")
public class BulkInvitationUploadController {

    private final BulkStudentFileParserService parserService;

    public BulkInvitationUploadController(
            BulkStudentFileParserService parserService
    ) {
        this.parserService = parserService;
    }

    /**
     * Upload an Excel (.xlsx) or PDF student list.
     *
     * This endpoint only parses the file and returns the detected
     * students. It does NOT send emails.
     *
     * Email sending is handled by the existing:
     *
     * POST /api/classroom-invitations/bulk-email
     */
    @PostMapping(
            value = "/parse-student-file",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> parseStudentFile(
            @RequestParam("file") MultipartFile file
    ) {

        try {

            List<BulkInvitationStudent> students =
                    parserService.parse(file);

            BulkInvitationUploadResponse response =
                    new BulkInvitationUploadResponse(
                            students.size(),
                            students
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    );

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "error",
                                    "Unable to read the uploaded file."
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "error",
                                    "Unexpected error while processing the student file."
                            )
                    );
        }
    }
}