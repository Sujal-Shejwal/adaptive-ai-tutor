package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.Topic;
import com.adaptiveaitutor.backend.service.TopicService;

@RestController
@RequestMapping("/api/topics")
@CrossOrigin(origins = "http://localhost:5173")
public class TopicController {

    private final TopicService topicService;

    public TopicController(
            TopicService topicService) {

        this.topicService =
                topicService;
    }

    // =====================================================
    // GET TOPICS BY UNIT
    // =====================================================

    @GetMapping("/unit/{unitId}")
    public ResponseEntity<List<Topic>>
            getTopicsByUnitId(
                    @PathVariable Long unitId) {

        return ResponseEntity.ok(
                topicService
                        .getTopicsByUnitId(
                                unitId
                        )
        );
    }

    // =====================================================
    // GET TOPIC BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Topic>
            getTopicById(
                    @PathVariable Long id) {

        return topicService
                .getTopicById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =====================================================
    // CREATE TOPIC
    // =====================================================

    @PostMapping
    public ResponseEntity<Topic>
            createTopic(
                    @RequestBody Topic topic) {

        return ResponseEntity.ok(
                topicService.createTopic(
                        topic
                )
        );
    }

    // =====================================================
    // DELETE TOPIC
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
            deleteTopic(
                    @PathVariable Long id) {

        try {

            boolean deleted =
                    topicService.deleteTopic(
                            id
                    );

            if (!deleted) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }
}