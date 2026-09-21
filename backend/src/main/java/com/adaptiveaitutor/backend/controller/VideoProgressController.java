package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.VideoProgress;
import com.adaptiveaitutor.backend.service.VideoProgressService;

@RestController
@RequestMapping("/api/video-progress")
@CrossOrigin(origins = "http://localhost:5173")
public class VideoProgressController {

    private final VideoProgressService videoProgressService;

    public VideoProgressController(
            VideoProgressService videoProgressService
    ) {
        this.videoProgressService =
                videoProgressService;
    }

    // =====================================================
    // SAVE / UPDATE PROGRESS
    // =====================================================

    @PostMapping
    public ResponseEntity<?> updateProgress(

            @RequestParam Long videoId,

            @RequestParam Long studentId,

            @RequestParam Integer watchedSeconds,

            @RequestParam Integer progressPercentage,

            @RequestParam Boolean completed
    ) {

        try {

            VideoProgress progress =
                    videoProgressService.updateProgress(
                            videoId,
                            studentId,
                            watchedSeconds,
                            progressPercentage,
                            completed
                    );

            return ResponseEntity.ok(
                    progress
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
                    );
        }
    }

    // =====================================================
    // GET STUDENT PROGRESS
    // =====================================================

    @GetMapping(
            "/video/{videoId}/student/{studentId}"
    )
    public ResponseEntity<?> getStudentProgress(

            @PathVariable Long videoId,

            @PathVariable Long studentId
    ) {

        VideoProgress progress =
                videoProgressService
                        .getStudentProgress(
                                videoId,
                                studentId
                        );

        if (progress == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                progress
        );
    }

    // =====================================================
    // GET ALL PROGRESS FOR VIDEO
    // =====================================================

    @GetMapping(
            "/video/{videoId}"
    )
    public ResponseEntity<List<VideoProgress>>
    getVideoProgress(
            @PathVariable Long videoId
    ) {

        return ResponseEntity.ok(
                videoProgressService
                        .getVideoProgress(videoId)
        );
    }
}