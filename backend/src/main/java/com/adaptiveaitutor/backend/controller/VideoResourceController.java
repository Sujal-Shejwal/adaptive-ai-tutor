package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.VideoResource;
import com.adaptiveaitutor.backend.service.VideoResourceService;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "http://localhost:5173")
public class VideoResourceController {

    private final VideoResourceService videoResourceService;

    public VideoResourceController(
            VideoResourceService videoResourceService
    ) {
        this.videoResourceService =
                videoResourceService;
    }

    // CREATE VIDEO
    @PostMapping
    public ResponseEntity<VideoResource> createVideo(
            @RequestParam String title,
            @RequestParam String videoUrl,
            @RequestParam Long topicId
    ) {

        try {

            VideoResource video =
                    videoResourceService.createVideo(
                            title,
                            videoUrl,
                            topicId
                    );

            return ResponseEntity.ok(video);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // GET VIDEOS FOR TOPIC
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<VideoResource>>
    getVideosByTopic(
            @PathVariable Long topicId
    ) {

        return ResponseEntity.ok(
                videoResourceService
                        .getVideosByTopic(topicId)
        );
    }

    // GET ONE VIDEO
    @GetMapping("/{id}")
    public ResponseEntity<VideoResource> getVideoById(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    videoResourceService
                            .getVideoById(id)
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // DELETE VIDEO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(
            @PathVariable Long id
    ) {

        try {

            videoResourceService.deleteVideo(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}