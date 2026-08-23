package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    // Get all topics belonging to a unit
    @GetMapping("/unit/{unitId}")
    public ResponseEntity<List<Topic>> getTopicsByUnitId(
            @PathVariable Long unitId) {

        return ResponseEntity.ok(
                topicService.getTopicsByUnitId(unitId)
        );
    }

    // Get a single topic by ID
    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(
            @PathVariable Long id) {

        return topicService.getTopicById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new topic
    @PostMapping
    public ResponseEntity<Topic> createTopic(
            @RequestBody Topic topic) {

        return ResponseEntity.ok(
                topicService.createTopic(topic)
        );
    }
}