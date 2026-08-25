package com.adaptiveaitutor.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.TopicProgress;
import com.adaptiveaitutor.backend.service.TopicProgressService;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:5173")
public class TopicProgressController {

    private final TopicProgressService topicProgressService;

    public TopicProgressController(
            TopicProgressService topicProgressService) {

        this.topicProgressService =
                topicProgressService;
    }

    // =====================================================
    // GET TOPIC PROGRESS
    // =====================================================

    @GetMapping("/user/{userId}/topic/{topicId}")
    public ResponseEntity<TopicProgress> getProgress(
            @PathVariable Long userId,
            @PathVariable Long topicId) {

        Optional<TopicProgress> progress =
                topicProgressService.getProgress(
                        userId,
                        topicId
                );

        return progress
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // =====================================================
    // MARK TOPIC COMPLETE
    // =====================================================

    @PostMapping(
            "/user/{userId}/topic/{topicId}/complete"
    )
    public ResponseEntity<TopicProgress> markComplete(
            @PathVariable Long userId,
            @PathVariable Long topicId) {

        try {

            TopicProgress progress =
                    topicProgressService.markComplete(
                            userId,
                            topicId
                    );

            return ResponseEntity.ok(progress);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // =====================================================
    // GET ALL SUBJECT PROGRESS
    // =====================================================

    @GetMapping("/user/{userId}/subjects")
    public ResponseEntity<Map<Long, Integer>>
            getSubjectProgress(
                    @PathVariable Long userId) {

        Map<Long, Integer> progress =
                topicProgressService.getSubjectProgress(
                        userId
                );

        return ResponseEntity.ok(progress);
    }

    // =====================================================
    // GET RECENT ACTIVITY
    // =====================================================

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<TopicProgress>>
            getRecentActivity(
                    @PathVariable Long userId) {

        return ResponseEntity.ok(
                topicProgressService
                        .getRecentActivity(userId)
        );
    }
}